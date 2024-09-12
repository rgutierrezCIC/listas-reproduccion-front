<template>
  <div class="inicio">
    <h1>Bienvenido a Listas de Reproducción</h1>
    <p>Explora, crea y modifica tus listas por Temática y añade tus vídeos favoritos.</p>
    <div class="links">
      <router-link to="/tematica" class="btn">Temáticas</router-link>
      <router-link to="/video" class="btn">Vídeos</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
};
</script>

<style scoped>
.inicio {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 600px; /* Ajusta la altura del fondo gris */
  text-align: center;
  background-color: #f0f0f0;
  margin-top: 70px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.links {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1rem;
  width: 200px;
}

@media (min-width: 2024px) {
  .inicio {
    min-height: 100vh; /* Ajusta la altura del fondo gris para pantallas grandes */
    display: flex;
    align-items: center;
  }
}
</style>