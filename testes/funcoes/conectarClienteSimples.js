'use strict'

/**
* Este teste tentar� conectar um cliente ao servidor xmpp utilizando m�todo simples.
* Observer que utilizamos o arquivo de configura��o onde usu�rios de teste s�o adicionados.
**/

var xmppCliente = require('node-xmpp-client');

// Aqui iremos pegar os usu�rios
var configuracao = require('../../configuracao/configuracao.js');
var _ = require('underscore');

// Chamamos o arquivo principal, ele vai iniciar o servidor.
var servidor = require('../../biblioteca/iniciador/principal');

var quantClientes = 0;
var clientes = [];

describe('Conecta o nosso cliente', function(){
    
    before(function(avancar) {
      servidor.prosseguir(configuracao, function() {
        console.log('Iniciou servidor xmpp com sucesso!');
        avancar();
      });
    });
    

    beforeEach(function(avancar){

      if (configuracao && configuracao.auth && configuracao.auth.length >= 1) {
        var quantAutenticacoes = configuracao.auth.length;

        var pronto = _.after(configuracao.auth.length, function() {
            avancar();
        });
        _.each(configuracao.auth, function(autenticacao) {
          // Percorremos as autentica��es dispon�veis
          quantAutenticacoes--;
  
          if (autenticacao.users) {
            // Percorre lista de usu�rios
            autenticacao.users.forEach(function (usuario) {
              var confConexaoClient = {
                jid: usuario.user + '@' + 'localhost',
                password: usuario.password
              }

              // cada um dos usu�rios possuem uma configura��o.
              clientes[usuario.user] = confConexaoClient;

              quantClientes++;
            });  
          } else {
            console.log('N�o possui usuarios para esta autentica��o.');	
          } 

          if (quantAutenticacoes <= 1) {
            pronto(); 		
          }
        });

      } else {
        console.log("N�o foi poss�vel carregar usu�rios, nesess�rio adicionar no arquivo de configura��o.");
        process.exit(1);
      }
    });

    it('Deve conectar f�cil se usu�rio e senha estivere corretos', function(pronto){
  
      var quantClientesConect = 1;
      var clts = [];
      var nomeUsuario;

      this.timeout(10000); // 10 segundos de espera para terminar.
  
      for (nomeUsuario in clientes){
        if (clientes.hasOwnProperty(nomeUsuario)) {
          // cada cliente � conectado
          clts[nomeUsuario] = new xmppCliente(clientes[nomeUsuario]);
  
          clts[nomeUsuario].on('online', function () {
            quantClientesConect++;
              
            //Quando todos os clientes da configura��o estiverem conectados
            if (quantClientesConect === quantClientes) {
                pronto(); 
            }

          });
        }
       }
 
    });
	
	// Este teste n�o est� funcionando ainda.
    it('deveria disparar um erro em caso de falha no c�digo', function(pronto){
  
      var quantClientesConect = 1;
      var clts = [];
      var nomeUsuario;

      this.timeout(10000); // 10 segundos de espera para terminar.
	  
      for (nomeUsuario in clientes){
        if (clientes.hasOwnProperty(nomeUsuario)) {
          clts[nomeUsuario] = new xmppCliente(clientes[nomeUsuario]);
  
          clts[nomeUsuario].on('online', function () {
            quantClientesConect++;
              
            //Quando todos os clientes da configura��o estiverem conectados
            if (quantClientesConect === quantClientes) {
              throw function() {};
            }

          });
	  
          clts[nomeUsuario].on('error', function(err) {
              //if(err === "XMPP authentication failure") {
              pronto();
              //}
          });
        }
      }
 
    });
    
});