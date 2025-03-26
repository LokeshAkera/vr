import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import ChatBox from "./ChatBox"; // Import the ChatBox component
import "../styles/VoiceCall.css"; // Import CSS

const socket = io("http://localhost:5000");

const VoiceCall = ({ role }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State for Chatbox
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isTeacherMuted, setIsTeacherMuted] = useState(false);
  const [notification, setNotification] = useState("");

  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(new Audio());
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    socket.on("offer", async (offer) => {
      if (role === "student") {
        peerConnectionRef.current = createPeerConnection();
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, localStreamRef.current);
        });

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", answer);

        setNotification("📢 You joined the call!");
        socket.emit("user-joined", role);
      }
    });

    socket.on("answer", async (answer) => {
      if (role === "teacher") {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("candidate", async (candidate) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("user-joined", (userRole) => {
      setNotification(`👋 A ${userRole} joined the call`);
    });

    socket.on("user-left", (userRole) => {
      setNotification(`🚪 A ${userRole} left the call`);
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("candidate");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [role]);

  const startCall = async () => {
    setIsCallActive(true);
    peerConnectionRef.current = createPeerConnection();

    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("offer", offer);

      setNotification("📢 Call started!");
      socket.emit("user-joined", role);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const leaveCall = () => {
    setIsCallActive(false);
    setIsChatOpen(false); // Close Chatbox when leaving call
    setIsMicMuted(false);
    setIsTeacherMuted(false);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setNotification("🚪 You left the call");
    socket.emit("user-left", role);
  };

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection();

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", event.candidate);
      }
    };

    peer.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
      remoteAudioRef.current.play();
    };

    return peer;
  };

  // 🎤 Mute/Unmute Microphone
  const toggleMuteMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  // 🔇 Mute/Unmute Teacher's Voice (Only for Student)
  const toggleMuteTeacher = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsTeacherMuted(remoteAudioRef.current.muted);
    }
  };

  return (
    <div className="voice-call-container">
      {notification && <div className="notification-bar">{notification}</div>}

      {/* Control Bar Inside Rounded Rectangle */}
      <div className="bottom-control-bar">
        {!isCallActive ? (
          <button className="call-btn" onClick={startCall}>
            {role === "teacher" ? "📞 Start Call" : "📞 Join Call"}
          </button>
        ) : (
          <>
            <button className="mute-btn" onClick={toggleMuteMic}>
              {isMicMuted ? "🎤 Unmute Mic" : "🔇 Mute Mic"}
            </button>

            {role === "student" && (
              <button className="mute-btn" onClick={toggleMuteTeacher}>
                {isTeacherMuted ? "🔊 Unmute Teacher" : "🔇 Mute Teacher"}
              </button>
            )}

            <button className="chat-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
              💬 {isChatOpen ? "Close Chat" : "Open Chat"}
            </button>

            <button className="leave-btn" onClick={leaveCall}>🚪 Leave Call</button>
          </>
        )}
      </div>

      {/* ✅ Chatbox Opens on Button Click ✅ */}
      {isChatOpen && isCallActive && (
        <div className="chatbox-wrapper">
          <ChatBox socket={socket} role={role} />
        </div>
      )}

      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};

export default VoiceCall;
