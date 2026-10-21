import myPhoto from '../assets/pthoto.png';
function Header() {
  return (
    <header className="header">
      <img
        src={myPhoto}
        alt="Profile"
        className="profile-image"
      />

      <h1>Kamila</h1>
      <p>Student & Future Software Developer</p>
    </header>
  );
}

export default Header;