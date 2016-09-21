import swal from 'sweetalert';

function alertError(text) {
  swal({
    text, type: 'error', title: 'Feil',
  });
}

function alertInfo(text) {
  swal({
    text, type: 'info', title: 'Info',
  });
}

function alertSuccess(text) {
  swal({
    text, type: 'success', title: 'Suksess',
  });
}

function alertWarning(text) {
  swal({
    text, type: 'warning', title: 'Advarsel',
  });
}

function alertPrompt(text, callback) {
  swal({
    text, type: 'input', title: '',
  }, callback);
}

export {
  alertError,
  alertInfo,
  alertSuccess,
  alertWarning,
  alertPrompt,
};
