import { useEffect, useState, useCallback } from "react";
import { io } from 'socket.io-client';
import './reserve.css'
import Header from './comp/Header'

function Reserve() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [serverIP] = useState("capacitor.dpdns.org");

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const fetchOrderStatus = useCallback(async () => {
    try {
      const orderNumber = getCookie('orderNumber');
      
      if (!orderNumber) {
        setError('注文番号が見つかりません。先に登録を行ってください。');
        setLoading(false);
        return;
      }

      // orderNumberから番号部分を抽出
      const numberPart = orderNumber.replace(/^(3DP|ACL|MTL)/, '');
      
      const response = await fetch(`http://${serverIP}:3001/api/orders/${numberPart}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setCompleted(true);
          setLoading(false);
          // Cookieを削除
          document.cookie = 'orderNumber=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          return;
        }
        throw new Error('注文情報の取得に失敗しました');
      }
      
      const data = await response.json();
      setOrderData(data);
      setError('');
    } catch (err) {
      console.error('注文情報取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "受け取り | 育英祭サレロボ";
    fetchOrderStatus();
    
    const socket = io(`http://${serverIP}:3001`);
    
    socket.on('connect', () => {
      console.log('WebSocketに接続しました');
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocketから切断されました');
    });
    
    socket.on('orderUpdated', (update) => {
      console.log('注文更新通知を受信:', update);
      const orderNumber = getCookie('orderNumber');
      
      if (orderNumber && update.key === orderNumber) {
        console.log('自分の注文が更新されました。再取得します。');
        fetchOrderStatus();
      }
    });
    
    const interval = setInterval(fetchOrderStatus, 5000);
    
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [fetchOrderStatus]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="rs-content">
          <div className="rs-status">
            <p>読み込み中...</p>
          </div>
        </div>
      </>
    );
  }

  if (completed) {
    return (
      <>
        <Header />
        <div className="rs-content">
          <div className="rs-status">
            <div className="rs-finished">
              <p>受取が完了しました。</p>
              <p>受け取メールを確認してください。</p>
              <p>ご利用ありがとうございました！</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="rs-content">
          <div className="rs-status">
            <p style={{ color: 'red' }}>{error}</p>
            <span>お手数ですが、受付までお越しください。</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="rs-content">
        <div className="rs-status">
          <div className="rs-true" style={{ display: orderData?.status === 'true' ? "block" : "none" }}>
            <div className="rs-true-p">
              <p>受け取りが可能です！</p>
              <p>までお越しください！</p>
            </div>
            <span>この画面を係員にお見せください。</span>
            <div className="rs-number">
              <span>{orderData?.type}{orderData?.number}</span>
            </div>
          </div>
          <div className="rs-false" style={{ display: orderData?.status === 'false' ? "block" : "none" }}>
            <p>現在作成中です。</p>
            <p>注文番号：{orderData?.type}{orderData?.number}</p>
            <p>もうしばらくお待ちください。</p>
            <span>作成開始: {orderData?.created}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reserve;