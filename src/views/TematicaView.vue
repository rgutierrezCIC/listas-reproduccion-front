<template>
  <div class="main-container">
    <!-- Lista de Temáticas -->
    <div :class="['tematica-list', { 'disabled': formVisible || isProcessing }]">
      <ul>
        <li v-for="tematica in tematicas" :key="tematica.id" :class="{ 'selected': tematica === selectedTematica }"
          @click="!formVisible && !isProcessing && selectTematica(tematica)">
          <strong>{{ tematica.nombre }}</strong> - Popularidad: {{ tematica.popularidad }}
          <p>{{ tematica.descripcion }}</p>
          <p><em>Fecha de Creación: {{ new Date(tematica.fechaCreacion).toLocaleDateString() }}</em></p>
        </li>
      </ul>
    </div>

    <!-- Contenedor de acciones y formulario -->
    <div :class="['actions-container', { 'enabled': isSectionEnabled }]">
      <div class="button-container" style="display: flex; gap: 1rem;">
        <button @click="startCreating" class="btn green" :disabled="formVisible || isProcessing" style="flex: 2;">Crear
          Nuevo</button>
        <button @click="startEditing" class="btn gray" :disabled="!selectedTematica || formVisible || isProcessing"
          style="flex: 1;">Modificar</button>
        <button @click="confirmDelete" class="btn gray" :disabled="!selectedTematica || formVisible || isProcessing"
          style="flex: 1;">Borrar</button>
      </div>

      <!-- Formulario dinámico -->
      <div v-if="formVisible" class="form-container">
        <h3>{{ editing ? 'Modificar Temática' : 'Crear Nueva Temática' }}</h3>
        <form @submit.prevent="handleSubmit">
          <label>
            Nombre:
            <input v-model="form.nombre" type="text" required />
            <span v-if="errors.nombre">{{ errors.nombre }}</span>
          </label>
          <label>
            Descripción:
            <textarea v-model="form.descripcion" required></textarea>
            <span v-if="errors.descripcion">{{ errors.descripcion }}</span>
          </label>
          <div class="form-row">
            <label style="flex: 1;">
              Popularidad:
              <input v-model.number="form.popularidad" type="number" required min="0" />
              <span v-if="errors.popularidad">{{ errors.popularidad }}</span>
            </label>
            <label style="flex: 1;">
              Activo:
              <input type="checkbox" v-model="form.activo" />
              <span v-if="errors.activo">{{ errors.activo }}</span>
            </label>
            <label style="flex: 3;">
              Fecha de Creación:
              <input type="date" v-model="form.fechaCreacion" required />
              <span v-if="errors.fechaCreacion">{{ errors.fechaCreacion }}</span>
            </label>
          </div>
          <button type="submit" class="btn submit">{{ editing ? 'Guardar Cambios' : 'Crear' }}</button>
          <button type="button" @click="cancelForm" class="btn cancel">Cancelar</button>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de borrado -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <p>¿Estás seguro de que deseas borrar esta temática?</p>
        <button @click="deleteTematica" class="btn red">Confirmar</button>
        <button @click="cancelDelete" class="btn cancel">Cancelar</button>
      </div>
    </div>

    <!-- Toast de confirmación -->
    <div v-if="toastVisible" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'TematicaView',
  setup() {
    const tematicas = ref([]);
    const selectedTematica = ref(null);
    const formVisible = ref(false);
    const isProcessing = ref(false);
    const showDeleteModal = ref(false);
    const editing = ref(false);
    const form = ref({
      nombre: '',
      descripcion: '',
      popularidad: 0,
      activo: false,
      fechaCreacion: ''
    });
    const errors = ref({});
    const toastVisible = ref(false);
    const toastMessage = ref('');

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

      if (!form.value.nombre) {
        errors.value.nombre = 'El nombre no puede estar vacío';
        valid = false;
      } else if (form.value.nombre.length > 255) {
        errors.value.nombre = 'El nombre no puede tener más de 255 caracteres';
        valid = false;
      }

      if (form.value.descripcion.length > 500) {
        errors.value.descripcion = 'La descripción no puede tener más de 500 caracteres';
        valid = false;
      }

      if (form.value.popularidad < 0) {
        errors.value.popularidad = 'La popularidad no puede ser negativa';
        valid = false;
      }

      if (form.value.fechaCreacion === '') {
        errors.value.fechaCreacion = 'La fecha de creación no puede estar vacía';
        valid = false;
      }

      if (form.value.activo === null) {
        errors.value.activo = 'El campo "activo" no puede estar vacío';
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
        if (editing.value) {
          // Actualizar existente
          await axios.put(`/api/tematicas/${selectedTematica.value.id}`, form.value);
          const index = tematicas.value.findIndex(t => t.id === selectedTematica.value.id);
          tematicas.value[index] = { ...form.value, id: selectedTematica.value.id };
          showToast('Temática actualizada exitosamente.');
        } else {
          // Crear nuevo
          const response = await axios.post('/api/tematicas', form.value);
          tematicas.value.push(response.data);
          showToast('Temática creada exitosamente.');
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

    // Selección de una temática
    const selectTematica = (tematica) => {
      if (!formVisible.value && !isProcessing.value) {
        selectedTematica.value = tematica;
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
      if (selectedTematica.value) {
        form.value = { ...selectedTematica.value };
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
    const deleteTematica = async () => {
      try {
        if (selectedTematica.value) {
          await axios.delete(`/api/tematicas/${selectedTematica.value.id}`);
          tematicas.value = tematicas.value.filter(t => t.id !== selectedTematica.value.id);
          selectedTematica.value = null;
          showToast('Temática eliminada exitosamente.');
        }
      } catch (error) {
        console.error('Error al eliminar la temática:', error);
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
        nombre: '',
        descripcion: '',
        popularidad: 0,
        activo: false,
        fechaCreacion: ''
      };
      selectedTematica.value = null;
    };

    // Cargar las temáticas cuando el componente se monta
    onMounted(fetchTematicas);

    return {
      tematicas,
      selectedTematica,
      formVisible,
      isProcessing,
      showDeleteModal,
      editing,
      form,
      errors,
      selectTematica,
      startCreating,
      startEditing,
      confirmDelete,
      deleteTematica,
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
  margin-top: 75px;
  display: flex;
  height: 500px;
  font-family: 'Arial', sans-serif;
  background-color: #f0f0f0;
  /* Color de fondo común */
}

/* Lista de temáticas - siempre ocupa la mitad de la pantalla */
.tematica-list {
  width: 50%;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f0f0f0;
  /* Color de fondo común */
}

/* Estilo para la lista de temáticas en estado deshabilitado */
.tematica-list.disabled {
  opacity: 0.5; /* Aplica un efecto visual para mostrar que está deshabilitada */
}

/* Estilo para el cursor prohibido en la lista de temáticas cuando el formulario está visible */
.tematica-list.disabled li {
  cursor: not-allowed; /* Cambia el cursor a puntero prohibido */
}

/* Estilo para la lista de temáticas */
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
  /* Color de fondo común */
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
textarea {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 100%;
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
  /* Fondo verde */
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  /* Asegura que esté por encima de otros elementos */
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>