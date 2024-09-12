// cypress/integration/videoView.spec.js

describe('VideoView', () => {
    beforeEach(() => {
      // Visita la página de videos antes de cada prueba
      cy.visit('/video');
    });
  
    it('debería mostrar la lista de videos', () => {
      // Verifica que la lista de videos esté visible
      cy.get('.video-list ul').should('be.visible');
    });
  
    it('debería permitir seleccionar un video', () => {
      // Selecciona el primer video de la lista
      cy.get('.video-list ul li').first().click();
      // Verifica que el video seleccionado tenga la clase 'selected'
      cy.get('.video-list ul li.selected').should('exist');
    });
  
    it('debería mostrar el formulario de creación al hacer clic en "Crear"', () => {
      // Haz clic en el botón "Crear"
      cy.get('button').contains('Crear').click();
      // Verifica que el formulario esté visible
      cy.get('.form-container').should('be.visible');
    });
  
    it('debería mostrar el formulario de edición al hacer clic en "Modificar"', () => {
      // Selecciona el primer video de la lista
      cy.get('.video-list ul li').first().click();
      // Haz clic en el botón "Modificar"
      cy.get('button').contains('Modificar').click();
      // Verifica que el formulario esté visible
      cy.get('.form-container').should('be.visible');
    });
  
    it('debería mostrar el modal de confirmación de borrado al hacer clic en "Borrar"', () => {
      // Selecciona el primer video de la lista
      cy.get('.video-list ul li').first().click();
      // Haz clic en el botón "Borrar"
      cy.get('button').contains('Borrar').click();
      // Verifica que el modal de confirmación esté visible
      cy.get('.modal-backdrop').should('be.visible');
    });
  
    it('debería permitir crear un nuevo video', () => {
      // Haz clic en el botón "Crear"
      cy.get('button').contains('Crear').click();
      // Espera explícita para asegurarse de que el formulario esté completamente renderizado
      cy.get('.form-container').should('be.visible');
      // Completa el formulario
      cy.get('[data-cy="titulo"]').type('Nuevo Video');
      cy.get('[data-cy="autor"]').type('Autor del Video');
      cy.get('[data-cy="duracion"]').type('120');
      cy.get('[data-cy="calidad"]').select('1080p');
      cy.get('[data-cy="clasificacion"]').select('12');
      cy.get('[data-cy="fechaCreacion"]').type('2023-01-01');
      cy.get('[data-cy="tematicaId"]').select('1'); // Asegúrate de que haya una temática con ID 1
      // Envía el formulario
      cy.get('[type="submit"]').click();
    });
  
    it('debería permitir modificar un video existente', () => {
      // Selecciona el primer video de la lista
      cy.get('.video-list ul li').first().click();
      // Haz clic en el botón "Modificar"
      cy.get('button').contains('Modificar').click();
      // Espera explícita para asegurarse de que el formulario esté completamente renderizado
      cy.get('.form-container').should('be.visible');
      // Modifica el formulario
      cy.get('[data-cy="titulo"]').clear().type('Video Modificado');
      cy.get('[data-cy="autor"]').clear().type('Autor Modificado');
      // Envía el formulario
      cy.get('[data-cy="submit"]').click();
    });
  
    it('debería permitir eliminar un video existente', () => {
      // Selecciona el primer video de la lista
      cy.get('.video-list ul li').first().click();
      // Haz clic en el botón "Borrar"
      cy.get('button').contains('Borrar').click();
      // Verifica que el modal de confirmación esté visible
      cy.get('.modal-backdrop').should('be.visible');
      // Confirma la eliminación
      cy.get('button').contains('Confirmar').click();
    });
  });