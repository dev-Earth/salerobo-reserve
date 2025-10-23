
import { useEffect } from 'react';
import "./header.css"

function Header() {
  useEffect(() => {
    const hamburger = document.querySelector('.hamburger-menu');
    const slideMenu = document.querySelector('.slide-menu.three-d-menu');
    if (!hamburger || !slideMenu) return;

    const handleHamburgerClick = function () {
      hamburger.classList.toggle('active');
      slideMenu.classList.toggle('active');
    };
    hamburger.addEventListener('click', handleHamburgerClick);

    const handleDocumentClick = function (e) {
      if (!hamburger.contains(e.target) && !slideMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        slideMenu.classList.remove('active');
      }
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      hamburger.removeEventListener('click', handleHamburgerClick);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <>
      <div className="header">
        <div className='header-logo'>
          <a href="/">
            <img src="/logo_salesio_sp.png" alt="" />
          </a>
        </div>
        <button class="hamburger-menu" aria-label="メニューを開く">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <nav class="slide-menu three-d-menu">
          <ul class="menu-list">
            <li><a href="/">トップ</a></li>
            <li><a href="https://www.salesio-sp.ac.jp/">サレジオ公式サイト</a></li>
            <li><a href="/reserve">お呼び出し</a></li>
          </ul>
          <div className='copy'>
            <p>© 2025 Salesio Robo Tech</p>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Header;