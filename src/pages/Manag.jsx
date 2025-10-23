import { useEffect, useState } from "react";
import './manag.css'
import { connectToNiimbotB1, disconnectNiimbot, printLabel, isConnected } from "../utils/niimbot";
import { io } from 'socket.io-client';

function Reserve() {
  const [connecting, setConnecting] = useState(false);
  const [connectedInfo, setConnectedInfo] = useState(null);
  const [error, setError] = useState("");
  const [popupIndex, setPopupIndex] = useState(null);
  const [waitData, setWaitData] = useState([]);
  const [calling, setCalling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [serverIP] = useState("capacitor.dpdns.org");

  useEffect(() => {
    document.title = "マネージャー | 育英祭サレロボ";
    fetchOrders();
    
    // WebSocket
    const socket = io(`http://${serverIP}:3001`);
    
    socket.on('connect', () => {
      console.log('WebSocketに接続しました');
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocketから切断されました');
    });
    
    socket.on('orderUpdated', (update) => {
      // console.log('注文更新通知を受信:', update);
      
      // 新規注文のみ自動印刷
      if (update.action === 'update' && update.data && update.data.status === 'false' && isConnected()) {
        // console.log('新規注文を検出。自動印刷を開始します:', update.data);
        printLabel(update.data).catch(err => {
          console.error('自動印刷エラー:', err);
          setError(`印刷エラー: ${err.message}`);
        });
      }
      
      fetchOrders();
    });
    
    const dataInterval = setInterval(fetchOrders, 10000);
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(dataInterval);
      clearInterval(timeInterval);
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://${serverIP}:3001/api/orders`);
      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }
      const data = await response.json();

      const waiting = data.filter(order => order.status === 'false');
      const called = data.filter(order => order.status === 'true');
      
      setWaitData(waiting);
      setCalling(called);
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPrinter = async () => {
    setError("");
    setConnecting(true);
    try {
      const res = await connectToNiimbotB1();
      setConnectedInfo(res);
    } catch (e) {
      console.error(e);
      setError(e?.message || "接続に失敗しました");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectPrinter = async () => {
    setError("");
    try {
      await disconnectNiimbot();
    } catch (e) {
      console.error(e);
      setError(e?.message || "切断に失敗しました");
    } finally {
      setConnectedInfo(null);
    }
  };

  const calculateElapsed = (createdTime) => {
    const created = new Date(createdTime.replace(/-/g, '/'));
    const diff = currentTime - created;
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h${minutes}m${seconds}s`;
    }
    return `${minutes}m${seconds}s`;
  };

  const handlePopupBackgroundClick = (e) => {
    if (e.target.classList.contains('popup-bg')) {
      setPopupIndex(null);
    }
  };

  return (
    <>
      <div className="mg-content">
        <nav>
          <div className="mg-title">
            <span>物品販売用 &nbsp; マネージャー</span>
            <p className="mg-title-1">呼び出し君 v2.1</p>
          </div>
          <ul>
            <div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="検索 (注文番号)" 
              />
            </div>
            <li>
              <button onClick={handleConnectPrinter} disabled={connecting}>
                {connecting ? "接続中…" : connectedInfo ? `接続済み: ${connectedInfo.deviceName || 'NIIMBOT-B1'}` : "プリンター接続"}
              </button>
            </li>
            {connectedInfo ? (
              <li>
                <button onClick={handleDisconnectPrinter}>
                  切断
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
        <div className="wall-2"></div>
        <div className="mg-c-title">
          <span>作成中</span>
          <div className="wall"></div>
          <span>呼び出し中</span>
        </div>
        <div className="mg-c-container">
          <div className="mg-c-wait">
            {loading ? (
              <div>読み込み中...</div>
            ) : waitData.filter(item => 
                searchQuery === "" || item.number.toString().startsWith(searchQuery)
              ).length === 0 ? (
              <div>待機中の注文はありません</div>
            ) : (
              waitData.filter(item => 
                searchQuery === "" || item.number.toString().startsWith(searchQuery)
              ).map((item, idx) => (
                <div className="mg-ct" key={`${item.type}${item.number}`} onClick={() => setPopupIndex(idx)} style={{ cursor: 'pointer' }}>
                  <div className="mg-ct-label">
                    <span>{item.type.toUpperCase()}{item.number}</span>
                  </div>
                  <div className="mg-ct-tp">
                    <span>作成-</span>
                    <span>{item.created}</span>
                  </div>
                  <div className="mg-ct-tp">
                    <span>経過時間：</span>
                    <span>{calculateElapsed(item.created)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="wall"></div>
          <div className="mg-c-calling">
            {loading ? (
              <div>読み込み中...</div>
            ) : calling.filter(item => 
                searchQuery === "" || item.number.toString().startsWith(searchQuery)
              ).length === 0 ? (
              <div>呼び出し中の注文はありません</div>
            ) : (
              calling.filter(item => 
                searchQuery === "" || item.number.toString().startsWith(searchQuery)
              ).map((item, idx) => (
                <div className="mg-ct" key={`${item.type}${item.number}`} onClick={() => setPopupIndex(waitData.length + idx)}>
                  <div className="mg-ct-label">
                    <p>{item.type.toUpperCase()}{item.number}</p>
                  </div>
                  <div className="mg-ct-tp">
                    <span>作成-</span>
                    <span>{item.created}</span>
                  </div>
                  <div className="mg-ct-tp">
                    <span>完了-</span>
                    <span>呼び出し中</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {popupIndex !== null && (() => {
          const allOrders = [...waitData, ...calling];
          const selectedOrder = allOrders[popupIndex];
          if (!selectedOrder) return null;
          
          return (
            <div className="popup-bg" onClick={handlePopupBackgroundClick} >
              <div className="popup-cont">
                <button className="popup-close" onClick={() => setPopupIndex(null)}>
                  <ion-icon name="close-outline"></ion-icon>
                </button>
                <div className="popup-detail-number">
                  <span>{selectedOrder.type.toUpperCase()}{selectedOrder.number}</span>
                </div>
                {selectedOrder.status === 'false' ? (
                  <>
                    <span>本当に完成しましたか？</span>
                    <button onClick={async () => {
                      try {
                        const response = await fetch(`http://${serverIP}:3001/api/orders/${selectedOrder.number}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'true' })
                        });
                        if (response.ok) {
                          await fetchOrders();
                          setPopupIndex(null);
                        }
                      } catch (error) {
                        console.error(error);
                        setError('ステータスの更新に失敗しました');
                      }
                    }}>完成したので呼び出す</button>
                  </>
                ) : (
                  <>
                    <span>受取確認をしますか？</span>
                    <button onClick={async () => {
                      if (confirm('本当に渡しましたか？')) {
                        try {
                          const response = await fetch(`http://${serverIP}:3001/api/orders/${selectedOrder.number}`, {
                            method: 'DELETE'
                          });
                          if (response.ok) {
                            await fetchOrders();
                            setPopupIndex(null);
                          }
                        } catch (error) {
                          console.error(error);
                          setError('受取確認の送信に失敗しました');
                        }
                      }
                    }}>受取確認メールを送信</button>
                  </>
                )}
                <div className="popup-detail-created">
                  <span>作成:</span>
                  <span>{selectedOrder.created}</span>
                </div>
                <div className="popup-detail-elapsed">
                  {selectedOrder.status === 'false' ? (
                    <>
                      <span>経過時間:</span>
                      <span>{calculateElapsed(selectedOrder.created)}</span>
                    </>
                  ) : (
                    <>
                      <span>完成</span>
                    </>
                  )}
                </div>
                <button onClick={async (e) => {
                  const button = e.target;
                  const originalText = button.textContent;
                  
                  if (!isConnected()) {
                    alert('プリンターが接続されていません');
                    return;
                  }
                  
                  button.disabled = true;
                  button.textContent = '印刷中';
                  
                  try {
                    await printLabel(selectedOrder);
                    alert('印刷が完了しました');
                    setPopupIndex(null);
                  } catch (error) {
                    console.error('印刷エラー:', error);
                    alert(`印刷に失敗しました: ${error.message}`);
                  } finally {
                    button.disabled = false;
                    button.textContent = originalText;
                  }
                }}>ラベル印刷</button>
                <button onClick={async () => {
                  if (confirm('本当に削除しますか？')) {
                    try {
                      const response = await fetch(`http://${serverIP}:3001/api/orders/${selectedOrder.number}`, {
                        method: 'DELETE'
                      });
                      if (response.ok) {
                        await fetchOrders();
                        setPopupIndex(null);
                      }
                    } catch (error) {
                      console.error(error);
                      setError('削除に失敗しました');
                    }
                  }
                }}>削除</button>
              </div>
            </div>
          );
        })()}
        {error && (
          <div style={{ color: 'red', marginTop: '8px' }}>
            エラー: {error}
          </div>
        )}
      </div >
    </>
  );
}

export default Reserve;