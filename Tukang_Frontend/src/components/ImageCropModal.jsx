import { useState, useRef, useEffect } from "react";

function ImageCropModal({ isOpen, imageSrc, onClose, onConfirm }) {
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 256, height: 256 });

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageLoad = (e) => {
    const img = e.target;
    const containerSize = 256;
    const aspect = img.naturalWidth / img.naturalHeight;
    
    if (aspect > 1) {
      // Landscape: match height, scale width
      setImgSize({
        width: containerSize * aspect,
        height: containerSize
      });
    } else {
      // Portrait or square: match width, scale height
      setImgSize({
        width: containerSize,
        height: containerSize / aspect
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragOffset({
      x: e.clientX - startDrag.x,
      y: e.clientY - startDrag.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartDrag({
        x: e.touches[0].clientX - dragOffset.x,
        y: e.touches[0].clientY - dragOffset.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setDragOffset({
      x: e.touches[0].clientX - startDrag.x,
      y: e.touches[0].clientY - startDrag.y,
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    if (!canvas || !ctx || !img) return;

    // Output size 500x500 for profile
    const outputSize = 500;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.clearRect(0, 0, outputSize, outputSize);

    const canvasScale = 500 / 256;

    ctx.save();
    ctx.translate(outputSize / 2 + dragOffset.x * canvasScale, outputSize / 2 + dragOffset.y * canvasScale);
    ctx.scale(zoom, zoom);
    ctx.drawImage(
      img,
      -(imgSize.width * canvasScale) / 2,
      -(imgSize.height * canvasScale) / 2,
      imgSize.width * canvasScale,
      imgSize.height * canvasScale
    );
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "profile_cropped.png", { type: "image/png" });
          onConfirm({
            file,
            dataUrl: canvas.toDataURL("image/png"),
          });
        }
      },
      "image/png",
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-on-surface">
      <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
        
        {/* Header */}
        <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
          <h3 className="text-sm font-extrabold text-on-surface">Potong Foto Profil</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6 flex flex-col items-center space-y-6">
          <div
            className="relative w-64 h-64 border-2 border-dashed border-secondary/40 rounded-full overflow-hidden flex items-center justify-center bg-surface-container-low shadow-inner cursor-move select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Original"
                onLoad={handleImageLoad}
                className="max-w-none max-h-none"
                style={{ width: `${imgSize.width}px`, height: `${imgSize.height}px` }}
              />
            </div>
            <div className="absolute inset-0 border-2 border-secondary rounded-full pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Zoom Control */}
          <div className="w-full space-y-1">
            <label className="text-[10px] text-on-surface-variant font-bold flex justify-between">
              <span>Perbesar Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              className="w-full accent-secondary cursor-pointer"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </div>
          <p className="text-[10px] text-on-surface-variant text-center leading-relaxed">
            Klik dan geser gambar untuk memposisikan bagian tengah foto di dalam lingkaran.
          </p>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-surface-variant/10 flex justify-end gap-2.5 bg-surface-container-high">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
          >
            Potong & Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
