'use client'

import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'

import { getTableLink } from '@/utils'

export default function QRCodeTable({
  tableNumber,
  tableToken,
  width = 250,
}: {
  tableNumber: number
  tableToken: string
  width?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (canvas) {
      canvas.height = width + 50
      canvas.width = width

      const canvasContext = canvas.getContext('2d')

      if (canvasContext) {
        canvasContext.fillStyle = '#fff'
        canvasContext.fillRect(0, 0, canvas.width, canvas.height)
        canvasContext.fillStyle = '#000'
        canvasContext.textAlign = 'center'
        canvasContext.font = '16px Arial'
        canvasContext.fillText(`Bàn số ${tableNumber}`, width / 2, canvas.height - 30)
        canvasContext.fillText('Quét mã QR để gọi món', width / 2, canvas.height - 10)

        const virtualCanvas = document.createElement('canvas')
        QRCode.toCanvas(virtualCanvas, getTableLink({ tableNumber, tableToken }), { width }, function (error) {
          if (error) console.error(error)
          canvasContext.drawImage(virtualCanvas, 0, 0, width, width)
        })
      }
    }
  }, [tableNumber, tableToken, width])

  return <canvas ref={canvasRef} />
}
