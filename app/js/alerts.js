import swal from 'sweetalert';

function alertError(text) {
  swal({
    text, type: 'error', title: '',
  });
}

function alertInfo(text) {
  swal({
    text, type: 'info', title: '',
  });
}

function alertSuccess(text) {
  swal({
    text, type: 'success', title: '',
  });
}

function alertWarning(text) {
  swal({
    text, type: 'warning', title: '',
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
