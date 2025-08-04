import { NavLink } from "react-router";



const Menu = ()=>{
  return( 
  <nav className="navbar p-3 bg-body-tertiary">
    <NavLink to="/" className="nav-link" >Home</NavLink>
    <NavLink to="/Profile" className="nav-link" >Profile</NavLink>
  </nav>
  )
}

export default Menu