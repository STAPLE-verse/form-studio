import { createRoot } from "react-dom/client"
import { FormStudio } from "../../src"
import "./index.css"

const root = createRoot(document.getElementById("root")!)

root.render(
  <FormStudio
    initialSchema={{}}
    initialUiSchema={{}}
    onSave={async (state) => {
      console.log("save", state)
    }}
  />
)
