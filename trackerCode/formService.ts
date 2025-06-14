export default class FormService {
  static FormData = {};
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
      let identifier = nameAttr || idAttr;
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
            // let minPriceKeywords = [      "low-price",
            //     "min-price",
            //     "minprice",
            //    ]
            // let maxPriceKeywords = [
            //   "high-price",
            //   "max-price",
            //   "maxprice",
            // ];
            // let isMinPrice = minPriceKeywords.some((keyword) =>
            //   identifier?.toLowerCase().includes(keyword)
            // );
            // let isMaxPrice = maxPriceKeywords.some((keyword) =>
            //   identifier?.toLowerCase().includes(keyword)
            // );

            identifier = identifier.replace(
              /minprice|min-price|low-price/gi,
              "min-price"
            );

            identifier = identifier.replace(
              /maxprice|max-price|high-price/gi,
              "max-price"
            );

            const target = e.target as HTMLInputElement;
            console.log(`Input value changed: ${target.value}`);
            FormService.FormData[identifier] = target.value;
            console.log("formData", FormService.FormData);
          });
        } else {
          input.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.type === "checkbox") {
              console.log(
                `Checkbox ${target.checked ? "checked" : "unchecked"}`
              );
              FormService.FormData[identifier] = target.value;
            } else {
              console.log(`Input value changed: ${target.value}`);
              FormService.FormData[identifier] = target.value;
            }
          });
        }
      }
    });
  }
}
