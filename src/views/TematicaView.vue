<template>
  <div>
    <div class="tematica-container">
      <ul>
        <li v-for="tematica in tematicas" :key="tematica.id">
          <strong>{{ tematica.nombre }}</strong> - Popularidad: {{ tematica.popularidad }}
          <p>{{ tematica.descripcion }}</p>
          <p><em>Fecha de Creación: {{ new Date(tematica.fechaCreacion).toLocaleDateString() }}</em></p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'TematicaView',
  setup() {
    const tematicas = ref([]);

    // Función para obtener las temáticas
    const fetchTematicas = async () => {
      try {
        const response = await axios.get('/api/tematicas'); // Cambia la URL según tu configuración
        tematicas.value = response.data; // Los datos ya están en el formato correcto
        console.log(tematicas.value); // Para depurar y verificar la respuesta
      } catch (error) {
        console.error('Error al obtener las temáticas:', error);
      }
    };

    // Cargar las temáticas cuando el componente se monta
    onMounted(fetchTematicas);

    return {
      tematicas
    };
  }
};
</script>

<style scoped>
/* Estilo para el contenedor de temáticas con scroll */
.tematica-container {
  height: 500px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 1rem;
  margin-top: 75px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

li {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

strong {
  display: block;
  font-size: 1.2rem;
}

p {
  margin: 0.5rem 0;
}
</style>
