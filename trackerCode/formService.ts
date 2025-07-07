import { TFormModel } from "../restServer/schemas/form.schema";

export default class FormService {
  static formID = crypto.randomUUID();
  static FormData: Partial<TFormModel> = {
    sessionID: "",
    pageID: "",
    formID: FormService.formID,
  };
  static FormDataArr: Array<Partial<TFormModel>> = [];

  static listenFormInputs() {
    const keywords = [
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
        const obj1: any = {
          ...existingFormData,
          ...this.FormData,
        };

        const obj2: any = {
          ...this.FormData,
          ...existingFormData,
        };

        const isEqual = Object.keys(obj1).every(
          (key) => obj1[key] === obj2[key]
        );

        if (isEqual) {
          this.FormDataArr[formIndex] = obj1;
        } else {
          this.FormDataArr.push(obj1);

          FormService.formID = crypto.randomUUID();
          this.FormData = { ...obj1, formID: FormService.formID };
        }
      } else {
        this.FormDataArr.push({ ...this.FormData });
        // formID resetlenmez çünkü ilk kez ekleniyor
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
        const normalizeIdentifier = () => {
          if (!identifier) return "";
          return identifier
            .toLowerCase()
            .replace(/minprice|min-price|low-price/gi, "min_price")
            .replace(/maxprice|max-price|high-price/gi, "max_price");
        };

        const normalizedKey = normalizeIdentifier();

        const assignValue = (value: string | number | boolean) => {
          this.FormData[normalizedKey] = value as any;
          ffunc();
        };

        if (
          element.type === "text" ||
          element.type === "number" ||
          element.tagName.toLowerCase() === "textarea"
        ) {
          input.addEventListener("change", (e) => {
            const target = e.target as HTMLInputElement;
            assignValue(target.value);
          });
        } else {
          input.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.type === "checkbox") {
              assignValue(target.value);
            } else {
              assignValue(target.value);
            }
          });
        }
      }
    });
  }
}
