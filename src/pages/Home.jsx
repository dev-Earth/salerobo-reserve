import { useEffect, useState } from "react";
import './home.css'
import Header from './comp/Header'

function Home() {
  const [selectedImage, setSelectedImage] = useState(null);

  // サレロボA
  const galleryImagesA = [
    { id: 1, src: "/roboA.jpg", description: "サレロボAの機体。\nコンベアがついています。" },
    { id: 2, src: "/roboA-part1.jpg", description: "サレロボAの足回り。今回はメカナムです。" },
    { id: 3, src: "/roboA-part2.jpg", description: "自作基板。モタドラが肺みたい。" },
    { id: 4, src: "/roboA-part3.jpg", description: "吸引装置。箱を吸って把持します。見た目以上に強い" },
    { id: 5, src: "/roboA-carry.jpg", description: "キャリーです。真ん中に人が座ります。" },
    { id: 6, src: "/seigyo.jpg", description: "プログラムを組む。手前のは自作コンロトーラーです。" },
    { id: 7, src: "/cad.png", description: "設計の風景。cadを使って設計します。" },
    { id: 8, src: "/roboA-part4.png", description: "コンベアがのびた。これで箱を運びます。" },
    { id: 9, src: "/roboA-part5.png", description: "試走はうまくいったのに🥺" },
  ];

  // サレロボB
  const galleryImagesB = [
    { id: 10, src: "/roboB.jpg", description: "サレロボBの機体" },
    { id: 11, src: "/roboB-part2.jpg", description: "足回り。ごつい" },
    { id: 12, src: "/seigyo.jpg", description: "制御作業" },
    { id: 13, src: "/roboB-part2.jpg", description: "基板の様子" },
    { id: 14, src: "/yume1.jpg", description: "組み立て作業" },
    { id: 15, src: "/robocon1.jpg", description: "機体全体" },
    { id: 16, src: "/yume1.jpg", description: "テスト走行" },
    { id: 17, src: "/seigyo.jpg", description: "調整中" },
    { id: 18, src: "/roboB-part2.jpg", description: "詳細部分" },
  ];


  useEffect(() => {
    document.title = "トップ | 育英祭サレロボ";
  }, []);
  return (
    <>
      <Header />
      <div className="home-content">
        <div className="home-top">
          <div className="home-sc">
            <div class="home-sc-body"></div>
          </div>
          <div className="home-sc">
            <div class="home-sc-body"></div>
          </div>
          <div className="home-sc">
            <div class="home-sc-body"></div>
          </div>
        </div>
        <div className="yobidashi">
          <p>現在の待ち時間は↓から</p>
          <a href="/reserve">待ち時間を確認する</a>
        </div>
        <div className="home-c1-about">
          <div className="home-c1ab-q">
            <p>サレジオロボテックとは</p>
          </div>
          <div className="home-c1ab-a">
            <p>NHKが主催する全国高等専門学校ロボットコンテスト(通称高専ロボコン)に出場するためのロボットを作成している集団</p>
          </div>
          <div className="home-c1ab-q aw">
            <p>どんなことをしているのか</p>
          </div>
          <div className="home-c1ab-a">
            <p>設計から回路、制御をすべて自分たちで行い、高専ロボコンで戦います。</p>
          </div>
        </div>
        <div className="home-c2-img">
          <div className="home-c2img">
            <img src="" alt="" />
          </div>
          <div className="home-c2img-des">
            <p></p>
          </div>
          <div className="home-c2img-wide">
            <img src="/yume1.jpg" alt="" />
          </div>
          <div className="home-c2img-des">
            <p>サレジオの夢工房で制作しています。</p>
            <p>手前はサレロボBの機体です。</p>
          </div>
          <div className="home-c2img">
            <img src="/seigyo.jpg" alt="" />
          </div>
          <div className="home-c2img-des">
            <p>制御の様子。</p>
            <p>基本的にarduinoを使用しています。</p>
          </div>
          <div className="home-c2img">
            <img src="/roboB-part2.jpg" alt="" />
          </div>
          <div className="home-c2img-des">
            <p>自作の基板が乗っています。</p>
            <p>この基板でモーターやロジャーなどを動かしています。</p>
          </div>
          <div className="home-c2img">
            <img src="/robocon3.jpg" alt="" />
          </div>
          <div className="home-c2img-des">
            <p>大会前日のテストランです。</p>
            <p>実際に機能するかどうか試します。</p>
          </div>
        </div>
        <div className="home-c3-imglib">
          <div className="home-c3-imglib-title">
            <p>2025年 サレロボAの機体</p>
          </div>
          <div className="gallery-grid">
            {galleryImagesA.map((image) => (
              <div
                key={image.id}
                className="gallery-tile"
                onClick={() => setSelectedImage(image)}
              >
                <img src={image.src} alt={image.description} />
              </div>
            ))}
          </div>
          <div className="home-c3-imglib-title">
            <p>2025年 サレロボBの機体</p>
          </div>
          <div className="gallery-grid">
            {galleryImagesB.map((image) => (
              <div
                key={image.id}
                className="gallery-tile"
                onClick={() => setSelectedImage(image)}
              >
                <img src={image.src} alt={image.description} />
              </div>
            ))}
          </div>
        </div>
        <div className="home-c4-last">
          <p>ご覧いただきありがとうございます。</p>
          <p>少しでも興味を持っていただけたら嬉しいです。</p>
          <p>ぜひサレジオで一緒にロボットを作りましょう！</p>
          <p style={{ fontSize: "22px", margin: "20px 0" }}>来年は必ず全国で優勝します！！！</p>
        </div>
        <div className='copyy'>
          <p>© 2025 Salesio Robo Tech</p>
          <p style={{ color: "#363636ff", fontSize: "12px" }}>このサイトは<a href="https://x.com/earth_ryzen5">@earth_ryzen5</a> が作りました。</p>
        </div>
        {selectedImage && (
          <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setSelectedImage(null)}
                aria-label="閉じる"
              >
                ×
              </button>
              <img src={selectedImage.src} alt={selectedImage.description} />
              <p className="modal-description">{selectedImage.description}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;