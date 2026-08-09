'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface WireframeNetBgProps {
  className?: string
  opacity?: number
  fullScreen?: boolean
}

export function WireframeNetBg({
  className,
  opacity = 0.45,
  fullScreen = false,
}: WireframeNetBgProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = fullScreen ? window.innerWidth : (container.clientWidth || window.innerWidth)
    const height = fullScreen ? window.innerHeight : (container.clientHeight || window.innerHeight)

    // Monochrome Obsidian 3D WebGL Wireframe Net Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
    camera.position.z = 3.8

    let renderer: THREE.WebGLRenderer | null = null
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)
    } catch (e) {
      console.warn('WebGL initialization error:', e)
      return
    }

    // 1. Primary Expanded Monochrome Wireframe Net TorusKnot
    const netGeo = new THREE.TorusKnotGeometry(3.4, 1.2, 160, 36)
    const netMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Obsidian Charcoal Black
      emissive: 0x334155, // Slate Emissive Glow
      emissiveIntensity: 0.6,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    })
    const netMesh = new THREE.Mesh(netGeo, netMat)
    scene.add(netMesh)

    // 2. Secondary Depth Grid Plane
    const planeGeo = new THREE.PlaneGeometry(20, 16, 64, 64)
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x64748b, // Slate Gray
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
    const planeMesh = new THREE.Mesh(planeGeo, planeMat)
    planeMesh.rotation.x = -Math.PI / 3
    planeMesh.position.z = -1.8
    scene.add(planeMesh)

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambLight)

    const dirLight = new THREE.DirectionalLight(0x0f172a, 2.0)
    dirLight.position.set(10, 15, 10)
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0x475569, 1.5)
    pointLight.position.set(-10, -10, -5)
    scene.add(pointLight)

    // Mouse Parallax Response
    let targetX = 0
    let targetY = 0
    const handleMouseMove = (event: MouseEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2.0
      targetY = (event.clientY / window.innerHeight - 0.5) * 2.0
    }

    window.addEventListener('mousemove', handleMouseMove)

    const clock = new THREE.Clock()
    let animId: number

    const animate = () => {
      const delta = clock.getDelta()
      const elapsedTime = clock.getElapsedTime()

      // Continuous Dynamic Rotations
      netMesh.rotation.x += delta * 0.2
      netMesh.rotation.y += delta * 0.25

      // Wave Deformation on Grid Plane
      const position = planeGeo.attributes.position
      for (let i = 0; i < position.count; i++) {
        const u = position.getX(i)
        const v = position.getY(i)
        const z = Math.sin(u * 1.5 + elapsedTime * 2.0) * Math.cos(v * 1.5 + elapsedTime * 1.5) * 0.4
        position.setZ(i, z)
      }
      planeGeo.attributes.position.needsUpdate = true

      // Parallax Response
      scene.rotation.y += (targetX - scene.rotation.y) * 0.06
      scene.rotation.x += (targetY - scene.rotation.x) * 0.06

      if (renderer) {
        renderer.render(scene, camera)
      }
      animId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!renderer) return
      const w = fullScreen ? window.innerWidth : (container.clientWidth || window.innerWidth)
      const h = fullScreen ? window.innerHeight : (container.clientHeight || window.innerHeight)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
        renderer.dispose()
      }
      netGeo.dispose()
      netMat.dispose()
      planeGeo.dispose()
      planeMat.dispose()
    }
  }, [fullScreen])

  const defaultClasses = fullScreen
    ? 'fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none'
    : 'absolute inset-0 z-0 w-full h-full overflow-hidden pointer-events-none'

  return (
    <div className={className || defaultClasses} style={{ opacity }}>
      <div ref={containerRef} className="h-full w-full pointer-events-none" />
    </div>
  )
}
