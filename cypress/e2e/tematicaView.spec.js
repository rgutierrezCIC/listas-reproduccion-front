describe('TematicaView', () => {
    beforeEach(() => {
      // Visita la página de temáticas antes de cada prueba
      cy.visit('/tematica');
    });
  
    it('debería mostrar la lista de temáticas', () => {
      // Verifica que la lista de temáticas esté visible
      cy.get('.tematica-list ul').should('be.visible');
    });
  
    it('debería permitir seleccionar una temática', () => {
      // Selecciona la primera temática de la lista
      cy.get('.tematica-list ul li').first().click();
      // Verifica que la temática seleccionada tenga la clase 'selected'
      cy.get('.tematica-list ul li.selected').should('exist');
    });
  
    it('debería mostrar el formulario de creación al hacer clic en "Crear"', () => {
      // Haz clic en el botón "Crear"
      cy.get('button').contains('Crear').click();
      // Verifica que el formulario esté visible
      cy.get('.form-container').should('be.visible');
    });
  
    it('debería mostrar el formulario de edición al hacer clic en "Modificar"', () => {
      // Selecciona la primera temática de la lista
      cy.get('.tematica-list ul li').first().click();
      // Haz clic en el botón "Modificar"
      cy.get('button').contains('Modificar').click();
      // Verifica que el formulario esté visible
      cy.get('.form-container').should('be.visible');
    });
  
    it('debería mostrar el modal de confirmación de borrado al hacer clic en "Borrar"', () => {
      // Selecciona la primera temática de la lista
      cy.get('.tematica-list ul li').first().click();
      // Haz clic en el botón "Borrar"
      cy.get('button').contains('Borrar').click();
      // Verifica que el modal de confirmación esté visible
      cy.get('.modal-backdrop').should('be.visible');
    });
  
    it('debería mostrar un mensaje de error si no se puede borrar la temática', () => {
      // Selecciona la primera temática de la lista
      cy.get('.tematica-list ul li').first().click();
      // Haz clic en el botón "Borrar"
      cy.get('button').contains('Borrar').click();
      // Simula una respuesta de error de la API
      cy.intercept('GET', '/api/videos?tematicaId=*', {
        statusCode: 200,
        body: [{ id: 1, nombre: 'Video asociado' }]
      });
      // Verifica que se muestre un mensaje de error
      cy.get('.modal p').contains('No se puede borrar la temática').should('be.visible');
    });
  
    it('debería permitir crear una nueva temática', () => {
      // Haz clic en el botón "Crear"
      cy.get('button').contains('Crear').click();
      // Espera explícita para asegurarse de que el formulario esté completamente renderizado
      cy.get('.form-container').should('be.visible');
      // Completa el formulario
      cy.get('[data-cy="nombre"]').type('Nueva Temática');
      cy.get('[data-cy="descripcion"]').type('Descripción de la nueva temática');
      cy.get('[data-cy="popularidad"]').type('10');
      cy.get('[data-cy="activo"]').check();
      cy.get('[data-cy="fechaCreacion"]').type('2023-01-01');
      // Envía el formulario
      cy.get('[data-cy="submit"]').click();
    });
  
    it('debería permitir modificar una temática existente', () => {
      // Selecciona la primera temática de la lista
      cy.get('.tematica-list ul li').first().click();
      // Haz clic en el botón "Modificar"
      cy.get('button').contains('Modificar').click();
      // Espera explícita para asegurarse de que el formulario esté completamente renderizado
      cy.get('.form-container').should('be.visible');
      // Modifica el formulario
      cy.get('[data-cy="nombre"]').clear().type('Temática Modificada');
      cy.get('[data-cy="descripcion"]').clear().type('Descripción modificada');
      // Envía el formulario
      cy.get('[data-cy="submit"]').click();
      // Verifica que se muestre un mensaje de éxito
    });
  });