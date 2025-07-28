(() => {
  "use strict";
  bsCustomFileInput.init();
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".validated-form");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

//for file upload to show the file names
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("formFile");
  const fileLabel = document.querySelector('label[for="formFile"]'); // Select the label associated with the input

  fileInput.addEventListener("change", function (event) {
    const fileName = event.target.files[0]
      ? event.target.files[0].name
      : "Default file input example";
    fileLabel.textContent = fileName;
  });
});
