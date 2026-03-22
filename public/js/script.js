// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (form.dataset.submitting === "true") {
          event.preventDefault();
          return;
        }

        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else if (form.dataset.singleSubmit === "true") {
          form.dataset.submitting = "true";

          const submitButtons = form.querySelectorAll(
            'button[type="submit"], input[type="submit"]',
          );

          submitButtons.forEach((button) => {
            button.disabled = true;
          });
        }

        form.classList.add("was-validated");
      },
      false,
    );
  });
})();
