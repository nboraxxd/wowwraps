'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeTable({ tableLink }: { tableLink: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    QRCode.toCanvas(canvas, tableLink, function (error) {
      if (error) console.error(error)
      console.log('success!')
    })
  }, [tableLink])

  return <canvas ref={canvasRef} />
}
