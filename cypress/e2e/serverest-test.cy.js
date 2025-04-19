/// <reference types="cypress" />
describe('Testes API - Serverest', () => {
    let tokenAdmin = '';
    const userCommon = {
      nome: 'Usuário Comum sem perfil de admin',
      email: `usuario${Date.now()}@qa.com`,
      password: 'teste123',
      administrador: 'false'
    };
  
    before(() => {
      // Login como admin
      cy.request({
        method: 'POST',
        url: 'https://serverest.dev/login',
        body: {
          email: 'leonardoantoniofernandes@hotmail.com',
          password: 'Vinhedo.02'
        }
      }).then((res) => {
        expect(res.status).to.eq(200);
        tokenAdmin = res.body.authorization;
      });
  
      // Cria usuário comum
      cy.request({
        method: 'POST',
        url: 'https://serverest.dev/usuarios',
        body: userCommon,
        failOnStatusCode: false
      }).then((res) => {
        if (res.status !== 201) {
          cy.log('Usuário comum já existe ou houve erro ao criar.');
        }
      });
    });
  
    it('Usuário comum deve fazer login com sucesso', () => {
      cy.request({
        method: 'POST',
        url: 'https://serverest.dev/login',
        body: {
          email: userCommon.email,
          password: userCommon.password
        }
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.authorization).to.exist;
      });
    });
  
    it('Usuário comum NÃO deve conseguir cadastrar um produto', () => {
      cy.request({
        method: 'POST',
        url: 'https://serverest.dev/login',
        body: {
          email: userCommon.email,
          password: userCommon.password
        }
      }).then((resLogin) => {
        const tokenCommon = resLogin.body.authorization;
  
        cy.request({
          method: 'POST',
          url: 'https://serverest.dev/produtos',
          headers: {
            Authorization: tokenCommon
          },
          body: {
            nome: 'Produto Comum',
            preco: 50,
            descricao: 'Não deve cadastrar',
            quantidade: 1
          },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(403);
          expect(res.body.message).to.contain('Rota exclusiva para administradores');
        });
      });
    });
  
    it('Admin deve conseguir cadastrar produto normalmente', () => {
      cy.request({
        method: 'POST',
        url: 'https://serverest.dev/produtos',
        headers: {
          Authorization: tokenAdmin
        },
        body: {
          nome: `Produto${Date.now()}`,
          preco: 123,
          descricao: 'Cadastro com token de admin',
          quantidade: 10
        }
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.message).to.eq('Cadastro realizado com sucesso');
      });
    });
  });
  