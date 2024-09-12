<template>
  <div class="main-container">
    <!-- Lista de Videos -->
    <div :class="['video-list', { 'disabled': formVisible || isProcessing }]">
      <ul>
        <li v-for="video in videos" :key="video.id" :class="{ 'selected': video === selectedVideo }"
          @click="!formVisible && !isProcessing && selectVideo(video)">
          <strong>{{ video.titulo }}</strong> - Autor: {{ video.autor }}
          <p>Duración: {{ video.duracion }} minutos</p>
          <p>Calidad: {{ video.calidad }}</p>
          <p>Clasificación: {{ video.clasificacion }}</p>
          <p>Creación: {{ new Date(video.fechaCreacion).toLocaleDateString() }}</p>
          <p>Temática: {{ video.tematica?.nombre }}</p>
        </li>
      </ul>
    </div>

    <!-- Contenedor de acciones y formulario -->
    <div :class="['actions-container', { 'enabled': isSectionEnabled }]">
      <div class="button-container" style="display: flex; gap: 1rem;">
        <button @click="startCreating" class="btn green" :disabled="formVisible || isProcessing"
          style="flex: 2;">Crear</button>
        <button @click="startEditing" class="btn gray" :disabled="!selectedVideo || formVisible || isProcessing"
          style="flex: 1;">Modificar</button>
        <button @click="confirmDelete" class="btn gray" :disabled="!selectedVideo || formVisible || isProcessing"
          style="flex: 1;">Borrar</button>
      </div>

      <!-- Formulario dinámico -->
      <div v-if="formVisible" class="form-container">
        <h3>{{ editing ? 'Modificando' : 'Creando' }}</h3>
        <form @submit.prevent="handleSubmit">
          <label>
            Título:
            <input v-model="form.titulo" type="text" required />
            <span v-if="errors.titulo">{{ errors.titulo }}</span>
          </label>
          <div class="form-row">
            <label style="flex: 3;">
              Autor:
              <input v-model="form.autor" type="text" required />
              <span v-if="errors.autor">{{ errors.autor }}</span>
            </label>
            <label style="flex: 1;">
              Temática:
              <select v-model="form.tematicaId" required class="form-input-left">
                <option v-for="tematica in tematicas" :key="tematica.id" :value="tematica.id">{{ tematica.nombre }}</option>
              </select>
              <span v-if="errors.tematicaId">{{ errors.tematicaId }}</span>
            </label>
          </div>
          <div class="form-row">
            <label style="flex: 1;">
              Duración:
              <input v-model.number="form.duracion" type="number" required min="1" class="form-input-right" />
              <span v-if="errors.duracion">{{ errors.duracion }}</span>
            </label>
            <label style="flex: 1;">
              Calidad:
              <select v-model="form.calidad" required class="form-input-right">
                <option v-for="option in calidadOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <span v-if="errors.calidad">{{ errors.calidad }}</span>
            </label>
            <label style="flex: 1;">
              Clasificación:
              <select v-model="form.clasificacion" required class="form-input-right">
                <option v-for="option in clasificacionOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <span v-if="errors.clasificacion">{{ errors.clasificacion }}</span>
            </label>
            <label style="flex: 2;">
              Creación:
              <input type="date" v-model="form.fechaCreacion" required />
              <span v-if="errors.fechaCreacion">{{ errors.fechaCreacion }}</span>
            </label>
          </div>
          <button type="submit" class="btn submit">{{ editing ? 'Modificar' : 'Crear' }}</button>
          <button type="button" @click="cancelForm" class="btn cancel">Cancelar</button>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de borrado -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <p>¿Estás seguro de que deseas borrar el video "{{ selectedVideo?.titulo }}"?</p>
        <button @click="deleteVideo" class="btn red">Confirmar</button>
        <button @click="cancelDelete" class="btn cancel">Cancelar</button>
      </div>
    </div>

    <!-- Toast de confirmación -->
    <div v-if="toastVisible" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script>
import { ref, onMounted, toRaw } from 'vue';
import axios from 'axios';

export default {
  name: 'VideoView',
  setup() {
    const videos = ref([]);
    const tematicas = ref([]);
    const selectedVideo = ref(null);
    const formVisible = ref(false);
    const isProcessing = ref(false);
    const showDeleteModal = ref(false);
    const editing = ref(false);
    const form = ref({
      titulo: '',
      autor: '',
      duracion: 0,
      calidad: '',
      clasificacion: '',
      fechaCreacion: '',
      tematicaId: null
    });
    const errors = ref({});
    const toastVisible = ref(false);
    const toastMessage = ref('');

    // Opciones para calidad y clasificación
    const calidadOptions = ['240p', '360p', '480p', '720p', '1080p', '4K', '8K', 'SD'];
    const clasificacionOptions = ['TP', '7', '12', '16', '18'];

    // Función para obtener los videos
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/videos');
        videos.value = response.data;
      } catch (error) {
        console.error('Error al obtener los videos:', error);
      }
    };

    // Función para obtener las temáticas
    const fetchTematicas = async () => {
      try {
        const response = await axios.get('/api/tematicas');
        tematicas.value = response.data;
      } catch (error) {
        console.error('Error al obtener las temáticas:', error);
      }
    };

    // Validar datos del formulario
    const validateForm = () => {
      errors.value = {};
      let valid = true;

      if (!form.value.titulo) {
        errors.value.titulo = 'El título no puede estar vacío';
        valid = false;
      } else if (form.value.titulo.length > 255) {
        errors.value.titulo = 'El título debe tener entre 1 y 255 caracteres';
        valid = false;
      }

      if (!form.value.autor) {
        errors.value.autor = 'El autor no puede estar vacío';
        valid = false;
      } else if (form.value.autor.length > 255) {
        errors.value.autor = 'El nombre del autor debe tener entre 1 y 255 caracteres';
        valid = false;
      }

      if (form.value.duracion <= 0 || form.value.duracion > 1440) {
        errors.value.duracion = 'La duración debe ser entre 1 y 1440 minutos';
        valid = false;
      }

      if (!form.value.calidad) {
        errors.value.calidad = 'La calidad es obligatoria';
        valid = false;
      } else if (!/^(240p|360p|480p|720p|1080p|4K|8K|SD)$/.test(form.value.calidad)) {
        errors.value.calidad = 'La calidad debe ser una de las siguientes: 240p, 360p, 480p, 720p, 1080p, 4K, 8K, SD';
        valid = false;
      }

      if (!form.value.clasificacion) {
        errors.value.clasificacion = 'La clasificación es obligatoria';
        valid = false;
      } else if (!/^(TP|7|12|16|18)$/.test(form.value.clasificacion)) {
        errors.value.clasificacion = 'La clasificación debe ser una de las siguientes: TP, 7, 12, 16, 18';
        valid = false;
      }

      if (form.value.fechaCreacion === '') {
        errors.value.fechaCreacion = 'La fecha de creación no puede estar vacía';
        valid = false;
      }

      if (!form.value.tematicaId) {
        errors.value.tematicaId = 'La temática es obligatoria';
        valid = false;
      }

      return valid;
    };

    // Manejar la sumisión del formulario
    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        const formData = toRaw(form.value); // Convertir a objeto plano
        const selectedTematica = tematicas.value.find(t => t.id === formData.tematicaId);
        formData.tematica = { ...selectedTematica }; // Actualizar el objeto tematica con todos los datos de la temática seleccionada
        delete formData.tematicaId; // Eliminar el campo tematicaId ya que no es necesario enviarlo

        console.log('Datos del formulario:', formData);
        if (editing.value) {
          // Actualizar existente
          const response = await axios.put(`/api/videos/${selectedVideo.value.id}`, formData);
          console.log('Respuesta del servidor (actualizar):', response.data);
          const index = videos.value.findIndex(v => v.id === selectedVideo.value.id);
          videos.value[index] = { ...formData, id: selectedVideo.value.id };
          showToast('Video modificado exitosamente.');
        } else {
          // Crear nuevo
          const response = await axios.post('/api/videos', formData);
          console.log('Respuesta del servidor (crear):', response.data);
          videos.value.push(response.data);
          showToast('Video creado exitosamente.');
        }
        cancelForm();
      } catch (error) {
        console.error('Error al guardar los cambios:', error);
      }
    };

    // Mostrar toast
    const showToast = (message) => {
      toastMessage.value = message;
      toastVisible.value = true;
      setTimeout(() => {
        toastVisible.value = false;
      }, 5000);
    };

    // Selección de un video
    const selectVideo = (video) => {
      if (!formVisible.value && !isProcessing.value) {
        selectedVideo.value = video;
      }
    };

    // Crear nuevo
    const startCreating = () => {
      resetForm();
      formVisible.value = true;
      editing.value = false;
      isProcessing.value = true;
    };

    // Editar
    const startEditing = () => {
      if (selectedVideo.value) {
        form.value = {
          ...selectedVideo.value,
          // calidad: selectedVideo.value.calidad,
          // tematicaId: selectedVideo.value.tematica?.id
        };
        formVisible.value = true;
        editing.value = true;
        isProcessing.value = true;
      }
    };

    // Borrar
    const confirmDelete = () => {
      showDeleteModal.value = true;
    };

    // Confirmar borrado
    const deleteVideo = async () => {
      try {
        if (selectedVideo.value) {
          const tituloVideo = selectedVideo.value.titulo;
          await axios.delete(`/api/videos/${selectedVideo.value.id}`);
          videos.value = videos.value.filter(v => v.id !== selectedVideo.value.id);
          selectedVideo.value = null;
          showToast(`Video "${tituloVideo}" eliminado exitosamente.`);
        }
      } catch (error) {
        console.error('Error al eliminar el video:', error);
      } finally {
        cancelDelete();
      }
    };

    // Cancelar el formulario
    const cancelForm = () => {
      formVisible.value = false;
      isProcessing.value = false;
      resetForm();
    };

    // Cancelar el modal de borrado
    const cancelDelete = () => {
      showDeleteModal.value = false;
    };

    // Reiniciar el formulario
    const resetForm = () => {
      form.value = {
        titulo: '',
        autor: '',
        duracion: 0,
        calidad: '',
        clasificacion: '',
        fechaCreacion: '',
        tematicaId: null
      };
      selectedVideo.value = null;
    };

    // Cargar los videos y temáticas cuando el componente se monta
    onMounted(async () => {
      await fetchVideos();
      await fetchTematicas();
    });

    return {
      videos,
      tematicas,
      selectedVideo,
      formVisible,
      isProcessing,
      showDeleteModal,
      editing,
      form,
      errors,
      calidadOptions,
      clasificacionOptions,
      selectVideo,
      startCreating,
      startEditing,
      confirmDelete,
      deleteVideo,
      cancelForm,
      cancelDelete,
      handleSubmit,
      showToast,
      toastVisible,
      toastMessage
    };
  }
};
</script>

<style scoped>
/* Contenedor principal */
.main-container {
  margin-top: 70px;
  display: flex;
  height: 500px;
  font-family: 'Arial', sans-serif;
  background-color: #f0f0f0;
}

/* Lista de videos - siempre ocupa la mitad de la pantalla */
.video-list {
  width: 50%;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f0f0f0;
}

/* Estilo para la lista de videos en estado deshabilitado */
.video-list.disabled {
  opacity: 0.5;
}

/* Estilo para el cursor prohibido en la lista de videos cuando el formulario está visible */
.video-list.disabled li {
  cursor: not-allowed;
}

/* Estilo para la lista de videos */
ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  cursor: pointer;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

li.selected {
  background-color: #e0e0e0;
}

li[disabled] {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
}

/* Contenedor de acciones */
.actions-container {
  width: 50%;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  opacity: 1;
}

/* Botones */
.button-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  width: 100%;
  /* Asegúrate de que el contenedor ocupe el ancho completo */
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  color: white;
  flex-grow: 1;
  /* Permite que los botones se expandan para llenar el espacio disponible */
  margin: 0 0.5rem;
  /* Añade un margen entre los botones */
}

.green {
  background-color: #28a745;
}

.gray {
  background-color: #6c757d;
}

.red {
  background-color: #dc3545;
}

.submit {
  background-color: #28a745;
}

.cancel {
  background-color: #6c757d;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
}

input,
textarea,
select {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 100%;
  background-color: #fff;
}

/* Formulario fila */
.form-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

/* Añadir margen inferior a los botones del formulario */
form .btn {
  margin-bottom: 1rem;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 300px;
  text-align: center;
}

.modal p {
  margin-bottom: 1rem;
}

.modal .btn {
  margin: 0.5rem;
  width: 100px;
}

/* Toast */
.toast {
  position: fixed;
  top: 10px;
  left: 10px;
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<style scoped>
/* Contenedor principal */
.main-container {
  margin-top: 70px;
  display: flex;
  height: 500px;
  font-family: 'Arial', sans-serif;
  background-color: #f0f0f0;
}

/* Lista de videos - siempre ocupa la mitad de la pantalla */
.video-list {
  width: 50%;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f0f0f0;
}

/* Estilo para la lista de videos en estado deshabilitado */
.video-list.disabled {
  opacity: 0.5;
}

/* Estilo para el cursor prohibido en la lista de videos cuando el formulario está visible */
.video-list.disabled li {
  cursor: not-allowed;
}

/* Estilo para la lista de videos */
ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  cursor: pointer;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

li.selected {
  background-color: #e0e0e0;
}

li[disabled] {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
}

/* Contenedor de acciones */
.actions-container {
  width: 50%;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  opacity: 1;
}

/* Botones */
.button-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  color: white;
}

.green {
  background-color: #28a745;
}

.gray {
  background-color: #6c757d;
}

.red {
  background-color: #dc3545;
}

.submit {
  background-color: #28a745;
}

.cancel {
  background-color: #6c757d;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
}

input,
textarea,
select {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 100%;
  background-color: #fff;
}

/* Formulario fila */
.form-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

/* Añadir margen inferior a los botones del formulario */
form .btn {
  margin-bottom: 1rem;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 300px;
  text-align: center;
}

.modal p {
  margin-bottom: 1rem;
}

.modal .btn {
  margin: 0.5rem;
  width: 100px;
}

/* Toast */
.toast {
  position: fixed;
  top: 10px;
  left: 10px;
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<style scoped>
/* Contenedor principal */
.main-container {
  margin-top: 70px;
  display: flex;
  height: 500px;
  font-family: 'Arial', sans-serif;
  background-color: #f0f0f0;
}

/* Lista de videos - siempre ocupa la mitad de la pantalla */
.video-list {
  width: 50%;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f0f0f0;
}

/* Estilo para la lista de videos en estado deshabilitado */
.video-list.disabled {
  opacity: 0.5;
}

/* Estilo para el cursor prohibido en la lista de videos cuando el formulario está visible */
.video-list.disabled li {
  cursor: not-allowed;
}

/* Estilo para la lista de videos */
ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  cursor: pointer;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

li.selected {
  background-color: #e0e0e0;
}

li[disabled] {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
}

/* Contenedor de acciones */
.actions-container {
  width: 50%;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  opacity: 1;
}

/* Botones */
.button-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  color: white;
}

.green {
  background-color: #28a745;
}

.gray {
  background-color: #6c757d;
}

.red {
  background-color: #dc3545;
}

.submit {
  background-color: #28a745;
}

.cancel {
  background-color: #6c757d;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
}

input,
textarea,
select {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 100%;
  text-align: right;
  background-color: #fff;
}

/* Formulario fila */
.form-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

/* Añadir margen inferior a los botones del formulario */
form .btn {
  margin-bottom: 1rem;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 300px;
  text-align: center;
}

.modal p {
  margin-bottom: 1rem;
}

.modal .btn {
  margin: 0.5rem;
  width: 100px;
}

/* Toast */
.toast {
  position: fixed;
  top: 10px;
  left: 10px;
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
