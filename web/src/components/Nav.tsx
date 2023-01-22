import { NavLink, Outlet } from "react-router-dom";

export const Nav = () => {
  return (
    <>
      <div className="py-1">
        <div>
          <ul className="menu menu-compact menu-horizontal gap-1">
            <li>
              <NavLink to="/" className="p-0 px-1">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="p-0 px-1">
                About
              </NavLink>
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
