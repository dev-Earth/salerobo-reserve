import { NiimbotBluetoothClient, getPrinterMetaById, ImageEncoder } from '@mmote/niimbluelib';
import { B1PrintTask } from '@mmote/niimbluelib/dist/cjs/print_tasks/B1PrintTask';

let client = null;
let printerMeta = null;

/**
 * NIIMBOT-B1 接続
 * @returns {Promise<{ deviceName: string, client: NiimbotBluetoothClient }>} 
 */
export async function connectToNiimbotB1() {
  if (!('bluetooth' in navigator)) {
    throw new Error('このブラウザはWeb Bluetoothに対応していません。');
  }

  try {
    client = new NiimbotBluetoothClient();
    
    const connectionInfo = await client.connect();

    const modelId = await client.abstraction.getPrinterModel();
    printerMeta = getPrinterMetaById(modelId);
    
    if (!printerMeta) {
      console.warn(`${modelId} が見つかりません。デフォルト設定を使用。`);
    }

    return { 
      deviceName: connectionInfo.deviceName || 'NIIMBOT-B1',
      client,
      printerMeta
    };
  } catch (error) {
    console.error('NIIMBOT接続エラー:', error);
    throw new Error(`プリンター接続に失敗しました: ${error.message}`);
  }
}

export async function disconnectNiimbot() {
  if (client) {
    try {
      await client.disconnect();
      client = null;
      printerMeta = null;
    } catch (error) {
      console.error('NIIMBOT切断エラー:', error);
    }
  }
}

export async function printLabel(orderData) {
  if (!client || !client.isConnected()) {
    throw new Error('プリンターが接続されていません');
  }

  try {
    const { type, number, created } = orderData;
    const orderNumber = `${type}${number}`;
    
    // console.log(`印刷開始: ${orderNumber}`);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const dpi = printerMeta?.dpi || 203;
    const widthMm = 30;
    const heightMm = 22;
    
    let width = Math.floor((widthMm / 25.4) * dpi);
    width = Math.ceil(width / 8) * 8; 
    
    let height = Math.floor((heightMm / 25.4) * dpi);
    
    canvas.width = width;
    canvas.height = height;
    
    // console.log(`キャンバスサイズ: ${width}x${height}`);
    
    // 背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // テキスト
    ctx.fillStyle = 'black';
    
    // 注文番号
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(orderNumber, canvas.width / 2, canvas.height / 2 - 10);
    
    // 作成時刻
    ctx.font = '24px Arial';
    ctx.fillText(created, canvas.width / 2, canvas.height / 2 + 40);
    
    // エンコード
    const printDirection = printerMeta?.printDirection || 'top';
    // console.log(`画像エンコード中... (printDirection: ${printDirection})`);
    const encodedImage = ImageEncoder.encodeCanvas(canvas, printDirection);
    // console.log(`エンコード完了: ${encodedImage.cols}x${encodedImage.rows}, ${encodedImage.rowsData.length} rows`);

    // B1PrintTaskで印刷
    // console.log('印刷タスク作成...');
    const printTask = new B1PrintTask(client.abstraction, {
      totalPages: 1
    });
    
    // console.log('印刷初期化');
    await printTask.printInit();
    
    // console.log('ページ印刷');
    await printTask.printPage(encodedImage, 1);
    
    // console.log('印刷完了待機');
    await printTask.waitForFinished();
    
    // console.log('印刷終了処理');
    await printTask.printEnd();
    
    console.log(`印刷完了: ${orderNumber}`);
  } catch (error) {
    console.error('印刷エラー:', error);
    
    // エラー発生時に接続状態
    if (client && !client.isConnected()) {
      console.error('プリンター接続が切断されました');
      client = null;
      printerMeta = null;
    }
    
    throw new Error(`印刷に失敗しました: ${error.message}`);
  }
}

/**
 * 接続状態
 * @returns {boolean}
 */
export function isConnected() {
  return client !== null && client.isConnected();
}
