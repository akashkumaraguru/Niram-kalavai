import "./App.css";
import GradientMaker from "./components/GradientMaker";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="App" data-testid="app-root">
      <GradientMaker />
      <Toaster theme="dark" position="bottom-center" closeButton />
    </div>
  );
}

export default App;
