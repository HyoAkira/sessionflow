export default class FormService {
  static listenFormInputs() {
    let keywords = [
      "comment",
      "message",
      "low-price",
      "high-price",
      "min-price",
      "max-price",
      "minprice",
      "maxprice",
      "gender",
    ];
    let formInputs = document.querySelectorAll("input, textarea, select");
    formInputs.forEach((input) => {
      const nameAttr = input.getAttribute("name");
      const idAttr = input.id;

      if (
        keywords.some(
          (keyword) =>
            nameAttr?.toLowerCase().includes(keyword) ||
            idAttr?.toLowerCase().includes(keyword)
        )
      ) {
        const element = input as HTMLInputElement;
        if (
          element.type === "text" ||
          element.type === "number" ||
          element.tagName.toLowerCase() === "textarea"
        ) {
          input.addEventListener("change", (e) => {
            const target = e.target as HTMLInputElement;
            console.log(`Input value changed: ${target.value}`);
          });
        } else {
          input.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.type === "checkbox") {
              console.log(
                `Checkbox ${target.checked ? "checked" : "unchecked"}`
              );
            } else {
              console.log(`Input value changed: ${target.value}`);
            }
          });
        }
      }
    });
  }
}
