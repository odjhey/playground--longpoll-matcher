import { NavLink, Outlet } from "react-router-dom";

export const Nav = () => {
  return (
    <>
      <div>
        <div>
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <Outlet></Outlet>
      </div>
    </>
  );
};
