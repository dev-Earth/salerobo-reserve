import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './regi.css'

function Reserve() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [serverIP] = useState("capacitor.dpdns.org");

  useEffect(() => {
    document.title = "登録 | 育英祭サレロボ";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData(e.target);
    const mail = formData.get('mail');
    const type = formData.get('type');

    try {
      const response = await fetch(`http://${serverIP}:3001/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mail, type }),
      });

      const result = await response.json();

      if (response.ok) {
        // Cookieに注文番号
        const expires = new Date();
        expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
        document.cookie = `orderNumber=${result.key}; expires=${expires.toUTCString()}; path=/`;
        
        // 遷移
        navigate('/reserve');
      } else {
        setMessage(`エラー: ${result.error}`);
      }
    } catch (error) {
      console.error('登録エラー:', error);
      setMessage('登録に失敗しました。サーバーに接続できません。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="regi-content">
        <div className="regi-list">
          <div className="regi-ctext">
            <p>サレロボ育英祭 呼び出し</p>
          </div>
          <form onSubmit={handleSubmit}>
            <input className="regi-cinput" type="email" name="mail" id="mail" placeholder="メールアドレス" required/>
            <div className="regi-type-radio">
              <label>
                <input type="radio" name="type" value="3DP" required />
                <span>3dプリンター</span>
              </label>
              <label>
                <input type="radio" name="type" value="ACL" />
                <span>アクリル</span>
              </label>
              <label>
                <input type="radio" name="type" value="MTL" />
                <span>金属</span>
              </label>
            </div>
            <input className="regi-cinput-btn" type="submit" value={isSubmitting ? "登録中..." : "登録"} disabled={isSubmitting} />
          </form>
          {message && (
            <p style={{fontSize:"14px", marginTop: "10px", color: message.includes('エラー') ? 'red' : 'green'}}>
              {message}
            </p>
          )}
          <p style={{fontSize:"14px", marginTop: "10px"}}>ご入力いただいた情報は呼び出しの目的以外には使用いたしません。</p>
        </div>
      </div>
    </>
  );
}

export default Reserve;