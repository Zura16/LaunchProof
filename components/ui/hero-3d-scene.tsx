'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function Hero3DScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Direct Three.js WebGL Scene (Ultra-fast, zero R3F runtime hook errors)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    let renderer: THREE.WebGLRenderer | null = null
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)
    } catch (e) {
      console.warn('WebGL initialization error:', e)
      return
    }

    // 1. Central Wireframe TorusKnot
    const torusGeo = new THREE.TorusKnotGeometry(1, 0.3, 128, 32)
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.3,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
    })
    const torusMesh = new THREE.Mesh(torusGeo, torusMat)
    scene.add(torusMesh)

    // 2. Orbiting Metallic Sphere
    const sphereGeo = new THREE.SphereGeometry(0.7, 64, 64)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
    })
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    sphereMesh.position.set(2.2, 1.2, -1)
    scene.add(sphereMesh)

    // 3. Secondary Wireframe Octahedron
    const octaGeo = new THREE.OctahedronGeometry(0.9)
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    })
    const octaMesh = new THREE.Mesh(octaGeo, octaMat)
    octaMesh.position.set(-2.2, -1, -0.5)
    scene.add(octaMesh)

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambLight)

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5)
    dirLight.position.set(10, 10, 5)
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0x6366f1, 1)
    pointLight.position.set(-10, -10, -5)
    scene.add(pointLight)

    // Mouse Interaction
    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / container.clientWidth - 0.5) * 2
      mouseY = ((event.clientY - rect.top) / container.clientHeight - 0.5) * 2
    }

    container.addEventListener('mousemove', handleMouseMove)

    const clock = new THREE.Clock()
    let animId: number

    const animate = () => {
      const delta = clock.getDelta()
      const elapsedTime = clock.getElapsedTime()

      // Smooth Rotations
      torusMesh.rotation.x += delta * 0.4
      torusMesh.rotation.y += delta * 0.5

      sphereMesh.rotation.y -= delta * 0.3
      sphereMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.25 + 1.2

      octaMesh.rotation.z += delta * 0.3
      octaMesh.position.y = Math.cos(elapsedTime * 1.2) * 0.25 - 1.0

      // Mouse Parallax Response
      scene.rotation.y += (mouseX * 0.3 - scene.rotation.y) * 0.05
      scene.rotation.x += (mouseY * 0.3 - scene.rotation.x) * 0.05

      if (renderer) {
        renderer.render(scene, camera)
      }
      animId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!container || !renderer) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
        renderer.dispose()
      }
      torusGeo.dispose()
      torusMat.dispose()
      sphereGeo.dispose()
      sphereMat.dispose()
      octaGeo.dispose()
      octaMat.dispose()
    }
  }, [])

  return (
    <div className="h-72 w-full max-w-lg mx-auto relative select-none">
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
    </div>
  )
}
