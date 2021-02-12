let tester = new SanityTester(document.body);

document.addEventListener('dragover', e => {
  e.preventDefault();
});

document.addEventListener('dragend', e => {
  e.preventDefault();
});

document.addEventListener('drop', e => {
  e.preventDefault();

  for (let file of e.dataTransfer.files) {
    tester.loadFile(file);
  }
});

tester.loadAPI(window.location.search);
