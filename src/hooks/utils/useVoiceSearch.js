import { useState, useEffect, useRef, useCallback } from 'react'

// Brave blocks SpeechRecognition behind a flag — we detect and warn
const getSpeechRecognition = () => {
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    null
  )
}

export const useVoiceSearch = (onResult) => {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [browserWarning, setBrowserWarning] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SR = getSpeechRecognition()
    if (!SR) {
      // Brave with shield blocking, or unsupported browser
      setBrowserWarning('Voice search not supported in this browser. Try Chrome or enable microphone in Brave settings.')
      setSupported(false)
      return
    }

    setSupported(true)
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-IN'
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
      setListening(false)
    }
    recognition.onerror = (e) => {
      console.warn('[VoiceSearch] error:', e.error)
      if (e.error === 'not-allowed') {
        setBrowserWarning('Microphone access denied. Check browser permissions.')
      }
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition

    return () => {
      try { recognition.abort() } catch {}
    }
  }, [])

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) {
      alert('Voice search is not supported in Brave by default.\n\nTo enable it:\n1. Go to brave://flags\n2. Search "Web Speech API"\n3. Enable it\n4. Relaunch Brave')
      return
    }
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch (e) {
      // Already started — abort and restart
      try {
        recognitionRef.current.abort()
        setTimeout(() => {
          recognitionRef.current.start()
          setListening(true)
        }, 200)
      } catch {}
    }
  }, [])

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop() } catch {}
    setListening(false)
  }, [])

  return { listening, supported, browserWarning, startListening, stopListening }
}
