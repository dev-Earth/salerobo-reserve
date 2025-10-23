import { useEffect } from "react";
import Header from './comp/Header'

function Notfound() {
  useEffect(() => {
    document.title = "NotFound | 育英祭サレロボ";
  }, []);
  return (
    <>
          <Header />
    <div className="nt-cont">
      <div></div>
    </div>
    </>
  );
}

export default Notfound;