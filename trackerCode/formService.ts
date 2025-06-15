import { TFormModel } from "../restServer/schemas/form.schema";

export default class FormService {
  static formID = crypto.randomUUID();
  static FormData: TFormModel = {
    sessionID: "",
    pageID: "",
    formID: FormService.formID,
  };
  static FormDataArr: Array<TFormModel> = [];

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
    const formInputs = document.querySelectorAll("input, textarea, select");

    const ffunc = () => {
      const formIndex = this.FormDataArr.findIndex(
        (el) => el.formID === this.formID
      );
      const existingFormData = this.FormDataArr[formIndex];
      if (existingFormData) {
        let obj1 = {
          ...existingFormData,
          ...this.FormData,
        };
        let obj2 = {
          ...this.FormData,
          ...existingFormData,
        };
        const filter = Object.keys(obj1).every(
          (key) => obj1[key] === obj2[key]
        );

        if (filter) {
          this.FormDataArr[formIndex] = obj1;
        } else {
          this.FormDataArr.push({ ...this.FormData });
          this.formID = crypto.randomUUID();
          this.FormData = {
            sessionID: "",
            pageID: "",
            formID: this.formID,
          };
        }
      } else {
        this.FormDataArr.push({ ...this.FormData });
        // this.formID = crypto.randomUUID();
        // this.FormData = {
        //   sessionID: "",
        //   pageID: "",
        //   formID: this.formID,
        // };
      }
    };

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
              "min_price"
            );

            identifier = identifier.replace(
              /maxprice|max-price|high-price/gi,
              "max_price"
            );

            const target = e.target as HTMLInputElement;
            console.log(`Input value changed: ${target.value}`);
            FormService.FormData[identifier] = target.value;
            ffunc();
          });
        } else {
          input.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.type === "checkbox") {
              console.log(
                `Checkbox ${target.checked ? "checked" : "unchecked"}`
              );
              FormService.FormData[identifier] = target.value;
              ffunc();
            } else {
              console.log(`Input value changed: ${target.value}`);
              FormService.FormData[identifier] = target.value;
              ffunc();
            }
          });
        }
      }
    });
  }
}
