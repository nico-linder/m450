import Recipe from "./components/Recipe/Recipe";
import MyNavbar from "./components/MyNavbar/MyNavbar";
import {findAllByDisplayValue} from "@testing-library/react";
import Browse from "./components/Browse/Browse";
import {Route, Routes} from "react-router-dom";
import Planer from "./components/Planer/Planer";
import AddRecipe from "./components/AddRecipe/AddRecipe";
import EditRecipe from "./components/EditRecipe/EditRecipe";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';


function App() {
  return (
      <>


      <MyNavbar/>
      <div>
        <Routes>
          <Route path="/" element={<Browse/>} />
          <Route path="/planer" element={<Planer/>} />
          <Route path="/new-menues" element={<AddRecipe/>} />
          <Route path="/recipes/:id/edit" element={<EditRecipe/>} />
        </Routes>
      </div>
      </>
  );
}

export default App;
