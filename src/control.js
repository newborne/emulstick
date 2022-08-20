import './App.css';
import * as emulstick from './emulstick';
import {
  useEffect,
  useCallback,
  useReducer,
  useRef,
  useLayoutEffect,
} from 'react';
import useKeyboard from './useKeyboard';
import useMouse from './useMouse'

function initState() {
  return {
    width: 1920,
    height: 1080,
    frameRate: 60,
    showVideo: false,
    deviceList: [],
    selectedVideoDevice: -1,
    selectedAudioDevice: -1,
    mousePadWidth: '200px',
    mousePadHeight: '200px'
  };
}

function reducer(state, action) {
  return {
    ...state,
    ...action,
  };
}

function Control() {
  const keyboard = useKeyboard()
  const [state, dispatch] = useReducer(reducer, {}, initState);
  const mouse = useMouse({
    width: state.mousePadWidth,
    height: state.mousePadHeight,
  })
  const videoElem = useRef(null)
  const videoWrapper = useRef(null)

  const requestDevice = async () => {
    const device = await navigator.usb.requestDevice({
      filters: [
        {
          vendorId: 0x534d,
        },
      ],
    });
    console.log(device);
    await device.open();
    await device.selectConfiguration(1);
  }
  const requestCameraAuth = async () => {
    navigator.mediaDevices.getUserMedia({
      video: {
        //  vendorId: 0x534d,
      },
    });
    navigator.mediaDevices.getUserMedia({
      audio: {
        //  vendorId: 0x534d,
      },
    });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const devices1 = [...devices]
    // this.deviceList = devices;
    dispatch({
      deviceList: devices1,
    })
    console.log(devices);
  }

  const beginCapture = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: state.deviceList[state.selectedVideoDevice].deviceId,
        width: state.width,
        height: state.height,
        frameRate: state.frameRate,
      },
      audio: {
        deviceId: state.deviceList[state.selectedAudioDevice].deviceId,
      },
    });
    console.log(media);
    // this.$refs.videoElem.srcObject = media;
    videoElem.current.srcObject = media
    // this.showVideo = true; 
    dispatch({
      showVideo: true
    })
  }
  const requestfull = () => {
    if (videoWrapper.current.webkitRequestFullscreen) {
      videoWrapper.current.webkitRequestFullscreen();
    } else if (videoWrapper.current.requestFullscreen()) {
      videoWrapper.current.requestFullscreen();
    }
  }

  return (
    <div>
      <div style={{ marginTop: 10 }}>
        <button
          onClick={async () => {
            const { primaryService } = await emulstick.openBlueTooth();
            const keyboardService = await emulstick.getKeyboardService(
              primaryService,
            );
            keyboard.keyboardServiceRef.current = keyboardService;
            const mouseService = await emulstick.getMouseService(
              primaryService,
            );
            mouse.mouseServiceRef.current = mouseService;
          }}
        >
          connect emulstick
        </button>
      </div>

      <div className="wrap">
        <fieldset className="constraints">
          <legend>Video Constraints</legend>
          <label>width: <input type="number" value={state.width} onChange={(e) => {
            dispatch({
              width: e.target.value
            })
          }} /></label>
          <label>height: <input type="number" value={state.height} onChange={(e) => {
            dispatch({
              width: e.target.value
            })
          }} /></label>
          <label>framerate: <input type="number" value={state.frameRate} onChange={(e) => {
            dispatch({
              frameRate: e.target.value
            })
          }} /></label>
        </fieldset>

        <div className="divider"></div>
        <button onClick={requestCameraAuth}>requestCameraAuth</button>

        <fieldset className="constraints flex">
          <legend>Select Device</legend>
          <label>
            video:
            {
              state.deviceList.length &&
              <select value={state.selectedVideoDevice} onChange={(e) => {
              console.log(e)
                dispatch({
                  selectedVideoDevice: +e.target.value
                })
              }}>
                {
                  state.deviceList.map((v, index) => {
                    return <option value={index}>{v.kind + ' ' + v.label}</option>
                  })
                }
              </select>
            }
          </label>

          <label>
            audio:
            {
              state.deviceList.length &&
              <select value={state.selectedAudioDevice} onChange={(e) => {
                dispatch({
                  selectedAudioDevice: Number(e.target.value)
                })
              }}>
                {
                  state.deviceList.map((v, i) => {
                    return <option value={i}>{v.kind + ' ' + v.label}</option>
                  })
                }
              </select>
            }
          </label>
        </fieldset >

        <div className="divider"></div>
        <fieldset className="constraints">
          <legend>log:</legend>
          {/* <pre>{state.deviceList[state.selectedVideoDevice]}</pre> */}
          <br />
          {/* <pre>{state.deviceList[state.selectedAudioDevice]}</pre> */}
        </fieldset>

        <div className="divider"></div>
        <button onClick={beginCapture}> beginCapture</button >

        <div className="divider"></div>
        <div ref={videoWrapper} className="videowrapper" allow>
          {mouse.dom}
          <video
            style={{
              visibility: state.showVideo ? 'visible' : 'none'
            }}
            autoPlay
            ref={videoElem}
            className="cameravideo"
          ></video>
        </div>
        <div className="divider"></div>
        {
          state.showVideo &&
          <button onClick={requestfull}> fullscreen video</button >
        }
      </div>

    </div>
  );
}

export default Control;