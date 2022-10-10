export function FillWithCCdata() {
  var pName = document.getElementById("CCDivNome");
  var pID = document.getElementById("CCDivID");


  if ((pName.textContent == "" || pID.textContent == ""))
    return;

  var elDocTypeToSearch = document.getElementById("DocumentType");
  var elDocNumberToSearch = document.getElementById("IntervenientViewModelDocumentNumber");
  var elNameIntervToAdd = document.getElementById("IntervenientViewModelClientName2");
  var elNameNifToAdd = document.getElementById("IntervenientViewModelNIF");

  var elNameToAdd = document.getElementById("IntervenientViewModelClientName");

  if (elNameToAdd != null && pName != null) {
    elNameToAdd.innerText = pName.innerText;
    elNameToAdd["value"] = pName.innerText;
  }

  if ((elDocNumberToSearch != null) && ((elNameIntervToAdd == null || elNameNifToAdd == null))) {

    //TODO:
    // Implementar validação que permita alterar o Nº Doc. a pesquisar apenas
    // se ainda não alterado para IDCC currente
    if (elDocNumberToSearch["value"] == "") {
      elDocNumberToSearch["value"] = CCDivID.innerText;
    }
  }
  else if (elNameIntervToAdd != null && elNameNifToAdd != null) {
    if (elNameIntervToAdd["value"] == "" || elNameNifToAdd["value"] == "") {
      elNameIntervToAdd["value"] = CCDivNome.innerText;
      elNameNifToAdd["value"] = CCDivNIF.innerText;
    }
  }
}


export function ClearCCFields() {
  var pName = document.getElementById("CCDivNome");

  // Verifica se consegue encontrar o elemento CCDivNome, quer dizer que o quadro está activo
  // Se o quadro está activo limpa campos, se não, não limpa
  if (pName == null)
    return;

  $("#CCDivNome").text("");
  $("#CCDivID").text("");
  $("#CCDivNIF").text("");
  $("#CCDivDN").text("");
  $("#CCDivMr").text("");
  $("#CCDivPostalCode").text("")
  $("#CCImgDiv").css("display", "none");

  $("#statusDesc").text("");
  $("#CCCanSign").text("");


  // ****** Hidden Fields
  $("#CCDivNotes").text("");
  $("#CCDivNationality").text("");
  $("#CCDivGender").text("");
  $("#CCDivHeight").text("");
  $("#CCDivExpireDate").text("");
  $("#CCDivFatherName").text("");
  $("#CCDivMotherName").text("");
  $("#CCDivSSNumber").text("");
  $("#CCDivSNSNumber").text("");
  $("#CCDivEmissonLocal").text("");

  var elDocNumberToSearch = document.getElementById("IntervenientViewModelDocumentNumber");

  var elNameIntervToAdd = document.getElementById("IntervenientViewModelClientName2");
  var elNameToAdd = document.getElementById("IntervenientViewModelClientName");




  if (elDocNumberToSearch != null)
    elDocNumberToSearch["value"] = "";

  if (elNameToAdd != null)
    elNameToAdd["value"] = "";

  if (elNameIntervToAdd != null)
    elNameIntervToAdd["value"] = "";


}

/* function SetNewCCData(name, cardNumber, nif, birthDate, imgSrc, cardIsExpired,
    gender, height, nationality, expiryDate, nameFather, nameMother,
    nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country) {
    if (name === "" && cardNumber === "") {
        $("#HTitleInstructions").css("display", "block");
    }
    else {
        $("#HTitleInstructions").css("display", "none");
    }
    if (imgSrc)
        $("#CCImgDiv").css("display", "block");
    else
        $("#CCImgDiv").css("display", "none");
    document.getElementById("CCImg").src = "data:image/png;base64," + imgSrc;
    if (cardIsExpired)
        $("#CCExpiredWarning").css("display", "block");
    else
        $("#CCExpiredWarning").css("display", "none");
    var strCardNumber = "";
    strCardNumber = String(cardNumber);
    strCardNumber = strCardNumber.replace(/\s/g, '');
    $("#CCDivNome").text(name);
    $("#CCDivID").text(strCardNumber);
    $("#CCDivNIF").text(nif);
    $("#CCDivDN").text(birthDate);
    $("#CCDivMr").text(address);
    $("#CCDivPostalCode").text(postalCode);
    $("#CCDivNotes").text(notes);
    if (notes != null) {
        var assinatura = "SABE ASSINAR";
        if (notes.toLowerCase().contains("não sabe assinar") || notes.toLowerCase().contains("não pode assinar")) {
            assinatura = "NÃO SABE ASSINAR";
        }
        $("#CCCanSign").text(assinatura);
    }
    else {
        $("#CCCanSign").text(notes);
    }
    // *************** Hiden Fields
    $("#CCDivNationality").text(nationality);
    $("#CCDivGender").text(gender);
    $("#CCDivHeight").text(height);
    $("#CCDivExpireDate").text(expiryDate);
    $("#CCDivEmissonDate").text(emissonDate);
    $("#CCDivFatherName").text(nameFather);
    $("#CCDivMotherName").text(nameMother);
    $("#CCDivSSNumber").text(nss);
    $("#CCDivSNSNumber").text(sns);
    $("#CCDivEmissonLocal").text(emissonLocal);
    $("#CCDivPhoto").text(imgSrc);
    $("#CCDivCountry").text(country);
    FillWithCCdata();
    $("#submitDataFromCC").click();
} */

const BASE_URL = 'http://localhost:12000/BackendPortal'; //FIXME

(function () {
  /* http://stackoverflow.com/questions/12404528/ie-parameters-get-undefined-when-using-them-in-settimeout/12404562#12404562 */
  if (document.all && !window.setTimeout.isPolyfill) {
    var __nativeST__ = window.setTimeout;
    window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
      var aArgs = Array.prototype.slice.call(arguments, 2);
      return __nativeST__(vCallback instanceof Function ? function () { vCallback.apply(null, aArgs); } : vCallback, nDelay);
    };
    window.setTimeout.isPolyfill = true;
  }

  if (document.all && !window.setInterval.isPolyfill) {
    var __nativeSI__ = window.setInterval;
    window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
      var aArgs = Array.prototype.slice.call(arguments, 2);
      return __nativeSI__(vCallback instanceof Function ? function () { vCallback.apply(null, aArgs); } : vCallback, nDelay);
    };
    window.setInterval.isPolyfill = true;
  }
})();

function uuid() {
  // http://www.ietf.org/rfc/rfc4122.txt
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] && 0x3) || 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  return s.join("");
}

function submit(data) {
  if (data.hasOwnProperty('notify') || data.hasOwnProperty('estado')) {
    console.log('problema na leitura dos dados: ' + data.notify || data.estado);
  } else {
    let json = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    //const processid = $("#CCCallProcessId").text() || null;
    let url = BASE_URL + '/api/citizencard/readcitizencarddata';
    //if (processid && processid != '') {
    //    url = url + '?processId=' + processid;
    //}
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    //xhr.setRequestHeader('X-API-TOKEN', angular.element(document).injector().get('$rootScope').repository.loggedUser.token);
    xhr.onreadystatechange = function () {

      if (this.readyState == 4 && this.status == 200) {
        let reply = JSON.parse(this.responseText);
        var postalCode = "";
        var addr = "";
        if (reply.address != null) {
          var posCodeP = reply.address.indexOf("#");
          addr = reply.address.substring(0, posCodeP);
          postalCode = reply.address.substring(posCodeP + 1);
        }
        SetNewCCData(reply.cCid.name + " " + reply.cCid.surname, reply.cCid.documentNumber, reply.cCid.taxNo, reply.cCid.dateOfBirth, reply.img64, reply.isExpired,
          reply.cCid.gender, reply.cCid.heigh, reply.cCid.nationality, reply.cCid.validityEndDate, reply.cCid.givenNameFather + " " + reply.cCid.surnameFather, reply.cCid.givenNameMother + " " + reply.cCid.surnameMother,
          reply.cCid.socialSecurityNo, reply.cCid.healthNo, addr, postalCode, reply.cCid.accidentalIndications, reply.cCid.locality ,reply.cCid.validityBeginDate, reply.cCid.localofRequest, reply.addressCountry, reply.cCid.issuingEntity, reply.cCid.documentType );
        console.log(reply);
      
      }
    };
    xhr.send(json);
  }
}

export function readCCAddress(componentCallback) {
  SetNewCCData = componentCallback;
  ClearCCFields();
  let url = BASE_URL + '/api/citizencard/generateccpluginrequestwithaddress';
  //const processid = $("#CCCallProcessId").text();
  //if (processid && processid != '') {
  //    url = url + '?processId=' + processid;
  //}
  autenticacaoGovPT.doOperation(submit,
    {
      minimumVersion: '2.0.23',
      operationType: 'read',
      requestGeneratorUrl: url,
      cms: uuid()
    });
}

export function readCC(componentCallback) {
  SetNewCCData = componentCallback;
  ClearCCFields();
  let url = BASE_URL + '/api/citizencard/generateccpluginrequest';
  //const processid = $("#CCCallProcessId").text();
  //if (processid && processid != '') {
  //    url = url + '?processId=' + processid;
  //}
  autenticacaoGovPT.doOperation(submit,
    {
      minimumVersion: '2.0.23',
      operationType: 'read',
      requestGeneratorUrl: url,
      cms: uuid()
    });
};

  let SetNewCCData;

var autenticacaoGovPT = (function operations() {
  'use strict';

  /* http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser?answertab=active#tab-top */
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  var isFirefox = typeof InstallTrigger !== 'undefined';
  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || 'WebkitAppearance' in document.documentElement.style;
  var isIE = /*@cc_on!@*/false || !!document.documentMode;
  var isEdge = !isIE && !!window.StyleMedia;
  var isChrome = !!window.chrome && !!window.chrome.webstore;

  var isOsxSupported = true;
  var isWindowsSupported = true;
  var isLinuxSupported = true;

  var isChromeSupported = true;
  var isOperaSupported = true;
  var isEdgeSupported = true;
  var isFirefoxSupported = true;
  var isIESupported = true;
  var isSafariSupported = true;

  var _operationType = {
    'cc': '/cc-auth',
    'cc-sso': '/pan',
    'sign': '/cc-sign',
    'read': '/cc-read',
    'alive': '/isAlive'
  };

  var _UPDATE_AGENT_VERSION_ = 'UPDATE_AGENT_VERSION';
  var _AGENTE_NAO_ENCONTRADO_ = 'AGENTE_NAO_ENCONTRADO';
  var _AGENT_DISCONNECTED_ = 'AGENT_DISCONNECTED';
  var _INSTALL_AGENT_ = 'INSTALL_AGENT';
  var _NAVEGADOR_NAO_SUPORTADO_ = 'NAVEGADOR_NAO_SUPORTADO';
  var _ERRO_GENERICO_ = 'ERRO_GENERICO';

  var _agent = {
    proto: 'https',
    port: null,
    uuid: null
  };

  var _callBack;
  var _endpoint;
  var _previousAuth = readCookie('previousAuth');
  var _noGenerator;
  var _retryCount = 3;
  var _timeout = 5000;
  var _reply = false;

  var isAuthServiceAlive = function (successCallback, failureCallback, parameter) {
    var messageFromHost = { isAlive: false, previousAuth: _previousAuth };
    var sp = [35153, 43456, 47920, 57379, 64704];
    var proto = ['http', 'https'];
    var errors = 0;
    var ieTimer = [];

    for (var i = 0; i < sp.length * 2; i++) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          try {
            var response = JSON.parse(this.responseText);
            if (response.hasOwnProperty('isAlive') && response.isAlive) {
              _agent.port = response.port;
              _agent.uuid = response.uuid;
              _agent.proto = response.hasOwnProperty('proto') ? response.proto : _agent.proto;
              delete response.port;
              delete response.uuid;
              successCallback(response, parameter);
            } else {
              throw 'json inválido';
            }
          } catch (e) {
            errors++;
            if (errors == sp.length * 2) {
              failureCallback(messageFromHost, parameter);
            }
          }
        }
      };
      xhr.onerror = function () {
        errors++;
        if (errors == sp.length * 2) {
          failureCallback(messageFromHost, parameter);
        }
      };
      xhr.open('POST', m(proto[~~(i / 5)]) + sp[i % 5] + _operationType['alive'], true);
      xhr.send();
    }
  };

  function m(proto) {
    return (proto == 'http') ? window.atob("aHR0cDovLzEyNy4wLjAuMTo=") : window.atob("aHR0cHM6Ly9t") + Math.floor(Math.random() * (20 - 1 + 1) + 1) + window.atob("Lm1vcmRvbW8uZ292LnB0Og==");
  }

  var ccOperation = function (retry) {
    if (!_reply) {
      var count = retry;
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          try {
            callbackFromGenerator(JSON.parse(this.responseText));
          } catch (e) {
            console.log(e);
            /* o timeout trata do problema */
          }
        }
      };

      if (!window.location.origin) {
        window.location.origin = 'https://' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
      }

      _noGenerator = setTimeout(function (count) { (count > 0) ? ccOperation(--count) : _callBack(generic_error('Gerador de pedidos não está disponível', _ERRO_GENERICO_)); }, _timeout, count);
      xhr.open('POST', _endpoint.requestGeneratorUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      //xhr.setRequestHeader('X-API-TOKEN', angular.element(document).injector().get('$rootScope').repository.loggedUser.token);
      xhr.send(JSON.stringify({ agent: _agent.uuid, cms: _endpoint.cms }));
    }
  };


  var callbackFromGenerator = function (response) {
    clearTimeout(_noGenerator);
    _reply = true;
    var type;
    var xhr = new XMLHttpRequest();
    var formDataBoundary;
    var dsm = '';
    var exec = true;

    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        try {
          var response = JSON.parse(this.responseText);
          response['authdata'] = true;
          _reply = false;                                //correção
          _callBack(response);
        } catch (e) {
          _callBack(generic_error(e, _ERRO_GENERICO_));
        }
      }
    };
    xhr.onerror = function () {
      _callBack(generic_error('Autenticação.gov.pt não está em execução', _AGENTE_NAO_ENCONTRADO_));
    };
    if (_endpoint.operationType) {
      type = _endpoint.operationType.toLowerCase();
    }
    xhr.open('POST', m(_agent.proto) + _agent.port + _operationType[type] + dsm, true);
    var formData = new FormData(formDataBoundary);

    if (exec) {
      Object.getOwnPropertyNames(response).forEach(function (val, idx, array) {
        formData.append(val.charAt(0).toUpperCase() + val.slice(1), response[val]);
      });
    }

    xhr.send((formDataBoundary === undefined || formDataBoundary === null) ? formData : formData.toString());
  }


  /*encontrado em deployJava.js*/
  function compareVersions(installed, required) {
    var a = installed.toString().split('.');
    var b = required.toString().split('.');

    for (var i = 0; i < a.length; ++i) {
      a[i] = Number(a[i]);
    }
    for (var i = 0; i < b.length; ++i) {
      b[i] = Number(b[i]);
    }
    if (a.length == 2) {
      a[2] = 0;
    }

    if (a[0] > b[0]) return true;
    if (a[0] < b[0]) return false;

    if (a[1] > b[1]) return true;
    if (a[1] < b[1]) return false;

    if (a[2] > b[2]) return true;
    if (a[2] < b[2]) return false;

    return true;
  }

  /* http://www.quirksmode.org/js/cookies.html */
  function createCookie(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toGMTString();
    } else
      var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
  }


  /* http://www.quirksmode.org/js/cookies.html */
  function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }


  function generic_error(message, error) {
    var messageFromHost = new Object();
    messageFromHost.estado = window.btoa(error);
    messageFromHost.descricao = window.btoa(message);
    return messageFromHost;
  }


  function successCallback(data) {
    createCookie('previousAuth', true, 365);
    if (!compareVersions(data.version, _endpoint.minimumVersion)) {  /* data.version < agentVersion */
      _callBack({ notify: _UPDATE_AGENT_VERSION_ });
    } else {
      ccOperation(_retryCount);
    }
  }


  function failureCallback(data) {
    if (_previousAuth) {
      _callBack({ notify: _AGENT_DISCONNECTED_ });
    } else {
      _callBack({ notify: _INSTALL_AGENT_ });
    }
  }


  function sendError(estado, descricao) {
    _callBack({ estado: window.btoa(estado), descricao: window.btoa(descricao) });
  }


  function start(callBack, endpoint) {
    var platform = window.navigator.platform.toLowerCase();
    var loaded = false;
    _callBack = callBack;
    _endpoint = endpoint;

    if (isOsxSupported && (platform === 'macintel') || isWindowsSupported && (platform === 'win32' || platform === 'win64') || isLinuxSupported && (navigator.platform.indexOf('Linux') >= 0)) {
      if (isOpera) {
        if (isOperaSupported) {
          loaded = loadConfig();
        }
      } else if (isChrome) {
        if (isChromeSupported) {
          loaded = loadConfig();
        }
      } else if (isEdge) {
        if (isEdgeSupported) {
          loaded = loadConfig();
        }
      } else if (isIE) {
        if (isIESupported) {
          var i = true;
          if (i) {
            loaded = loadConfig();
          }
        }
      } else if (isFirefox) {
        if (isFirefoxSupported) {
          loaded = loadConfig();
        }
      } else if (isSafari) {
        if (isEdgeSupported) {
          loaded = loadConfig();
        }
      }
    }

    if (!loaded) {
      sendError(_NAVEGADOR_NAO_SUPORTADO_, platform + " - Navegador não suportado - [" + browserInfo() + "]");
    }
  }

  function browserInfo() {
    return "CodeName: " + navigator.appCodeName + "; Name: " + navigator.appName + "; Version: " + navigator.appVersion + "; Platform: " + navigator.platform + "; User-agent header: " + navigator.userAgent;
  }

  function loadConfig() {
    isAuthServiceAlive(successCallback, failureCallback);
    return true;
  }

  return {
    isAuthServiceAlive: isAuthServiceAlive,
    doOperation: start
  };

})();
