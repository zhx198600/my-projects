import { useState, useMemo } from 'react'
import { Box, Cylinder, Cone } from '@react-three/drei'
import { useAppStore } from '@/store'
import { ComponentInfo } from '@/types'
import * as THREE from 'three'

interface ArchitectureComponentProps {
  componentInfo: ComponentInfo
  children: React.ReactNode
  onSelect?: (info: ComponentInfo) => void
  isSelected?: boolean
}

interface HighlightableMeshProps {
  children: React.ReactNode
}

function HighlightableMesh({ children }: HighlightableMeshProps) {
  return <>{children}</>
}

function ArchitectureComponent({ 
  componentInfo, 
  children, 
  onSelect,
  isSelected = false
}: ArchitectureComponentProps) {
  const [hovered, setHovered] = useState(false)

  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e: any) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: any) => {
    e.stopPropagation()
    onSelect?.(componentInfo)
  }

  return (
    <group
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <HighlightableMesh>
        {children}
      </HighlightableMesh>
      {(isSelected || hovered) && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[7, 6, 8]} />
          <meshBasicMaterial 
            color={isSelected ? '#FFD700' : '#FFA500'} 
            wireframe 
            transparent 
            opacity={0.4} 
          />
        </mesh>
      )}
    </group>
  )
}

interface AncientArchitectureProps {
  onComponentSelect?: (info: ComponentInfo) => void
}

function createRoofGeometry(width: number, depth: number, height: number, overhang: number): THREE.Shape {
  const shape = new THREE.Shape()
  
  const halfWidth = width / 2
  const halfDepth = depth / 2
  
  shape.moveTo(-halfWidth - overhang, 0)
  shape.lineTo(-halfWidth, 0)
  shape.lineTo(-halfWidth * 0.6, height * 0.3)
  shape.lineTo(0, height)
  shape.lineTo(halfWidth * 0.6, height * 0.3)
  shape.lineTo(halfWidth, 0)
  shape.lineTo(halfWidth + overhang, 0)
  
  return shape
}

function createEavesCurve(): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.3, 0.2, 0.5, 0.3, 0.8, 0.15)
  shape.lineTo(1, 0)
  shape.lineTo(0, 0)
  return shape
}

export function AncientArchitecture({ onComponentSelect }: AncientArchitectureProps) {
  const selectedComponent = useAppStore((state) => state.selectedComponent)
  const setSelectedComponent = useAppStore((state) => state.setSelectedComponent)

  const handleSelect = (info: ComponentInfo) => {
    setSelectedComponent(info.id)
    onComponentSelect?.(info)
  }

  const mainHallInfo: ComponentInfo = {
    id: 'main-hall',
    name: '主殿主体',
    description: '古代建筑的主要殿堂部分，采用传统木构建筑技术，是整个建筑群的核心区域',
    category: '建筑主体',
    metadata: { 宽度: 6, 高度: 3.5, 进深: 7, 结构: '抬梁式' }
  }

  const roofInfo: ComponentInfo = {
    id: 'roof',
    name: '歇山顶',
    description: '歇山顶，中国古建筑屋顶样式之一，等级仅次于庑殿顶。特点是有一条正脊、四条垂脊、四条戗脊，形成九个屋脊，又称九脊顶。屋顶上部为悬山式，下部为庑殿式，兼具庄重与轻盈之美。',
    category: '屋顶',
    metadata: { 样式: '歇山顶', 屋脊数量: 9, 飞檐高度: 0.5, 颜色: '青灰色' }
  }

  const mainRidgeInfo: ComponentInfo = {
    id: 'main-ridge',
    name: '正脊',
    description: '正脊是屋顶最高处的水平屋脊，两端通常装饰有鸱吻或脊兽，具有装饰和固定屋顶的双重作用。正脊的装饰等级体现了建筑的等级。',
    category: '屋脊',
    metadata: { 位置: '正脊', 长度: 5, 装饰: '鸱吻' }
  }

  const ridgeDecorInfo: ComponentInfo = {
    id: 'ridge-decor',
    name: '脊兽',
    description: '脊兽是中国古代建筑屋脊上的装饰性雕塑，具有等级象征意义。通常包括龙、凤、狮子、天马、海马、狻猊、狎鱼、獬豸、斗牛、行什等，数量越多等级越高。',
    category: '装饰',
    metadata: { 位置: '正脊两端', 类型: '鸱吻/脊兽', 数量: 2 }
  }

  const eavesInfo: ComponentInfo = {
    id: 'eaves',
    name: '飞檐',
    description: '飞檐是中国古建筑特有的建筑形式，屋檐向上翘起，形如飞鸟展翅。不仅具有美学价值，还能扩大采光面、利于排水，并赋予建筑灵动轻盈的美感。',
    category: '屋檐',
    metadata: { 样式: '斗拱支撑', 挑出长度: 0.8, 角度: '向上翘起' }
  }

  const pillarsInfo: ComponentInfo[] = [
    { 
      id: 'pillar-front-left', 
      name: '前左柱', 
      description: '主殿前左侧立柱，采用传统木柱样式，柱身通常有彩绘或雕刻，柱础有装饰性雕刻', 
      category: '柱子',
      metadata: { 位置: '前左', 材质: '木材', 柱径: 0.35 }
    },
    { 
      id: 'pillar-front-right', 
      name: '前右柱', 
      description: '主殿前右侧立柱，与左侧立柱对称，体现中国建筑的对称美学', 
      category: '柱子',
      metadata: { 位置: '前右', 材质: '木材', 柱径: 0.35 }
    },
    { 
      id: 'pillar-back-left', 
      name: '后左柱', 
      description: '主殿后左侧立柱，支撑后檐屋顶', 
      category: '柱子',
      metadata: { 位置: '后左', 材质: '木材', 柱径: 0.35 }
    },
    { 
      id: 'pillar-back-right', 
      name: '后右柱', 
      description: '主殿后右侧立柱，与后左柱对称', 
      category: '柱子',
      metadata: { 位置: '后右', 材质: '木材', 柱径: 0.35 }
    },
  ]

  const stepsInfo: ComponentInfo = {
    id: 'steps',
    name: '月台台阶',
    description: '通往主殿的石阶，中国古建筑中台阶的数量和高度有严格的等级规定。通常分为奇数级，象征步步高升。月台是殿前的平台，用于仪式活动。',
    category: '台阶',
    metadata: { 级数: 3, 材质: '青石', 月台宽度: 8 }
  }

  const roofTilesColor = '#696969'
  const ridgeColor = '#505050'
  const decorColor = '#2F4F4F'
  const woodColor = '#D2B48C'
  const darkWoodColor = '#8B4513'

  return (
    <group position={[0, 0, 0]}>
      <ArchitectureComponent
        componentInfo={mainHallInfo}
        onSelect={handleSelect}
        isSelected={selectedComponent === mainHallInfo.id}
      >
        <Box
          args={[6, 3.5, 7]}
          position={[0, 1.75, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={woodColor} roughness={0.85} />
        </Box>
        
        <Box
          args={[6.2, 0.15, 7.2]}
          position={[0, 3.575, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
        </Box>
        
        <Box
          args={[0.1, 3, 0.05]}
          position={[-2, 1.75, 3.51]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
        </Box>
        <Box
          args={[0.1, 3, 0.05]}
          position={[2, 1.75, 3.51]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
        </Box>
        <Box
          args={[3.8, 0.1, 0.05]}
          position={[0, 3.2, 3.51]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
        </Box>
        
        <Box
          args={[0.1, 3, 0.05]}
          position={[-2, 1.75, -3.51]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
        </Box>
        <Box
          args={[0.1, 3, 0.05]}
          position={[2, 1.75, -3.51]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
        </Box>
      </ArchitectureComponent>

      <ArchitectureComponent
        componentInfo={roofInfo}
        onSelect={handleSelect}
        isSelected={selectedComponent === roofInfo.id}
      >
        <group position={[0, 3.65, 0]}>
          <mesh
            castShadow
            receiveShadow
          >
            <boxGeometry args={[5.5, 0.8, 6.5]} />
            <meshStandardMaterial color={roofTilesColor} roughness={0.9} />
          </mesh>
          
          <mesh
            castShadow
            receiveShadow
          >
            <coneGeometry args={[4.2, 2.5, 4]} />
            <meshStandardMaterial color={roofTilesColor} roughness={0.9} />
            <mesh position={[0, 1.25, 0]}>
              <meshStandardMaterial color={roofTilesColor} roughness={0.9} />
            </mesh>
          </mesh>
          
          <group position={[0, 0, 0]}>
            <mesh
              castShadow
              receiveShadow
            >
              <boxGeometry args={[4.5, 0.12, 1]} />
              <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.06, 0.45]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[4.5, 0.15, 0.15]} />
              <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.06, -0.45]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[4.5, 0.15, 0.15]} />
              <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
            </mesh>
          </group>
        </group>
      </ArchitectureComponent>

      <ArchitectureComponent
        componentInfo={eavesInfo}
        onSelect={handleSelect}
        isSelected={selectedComponent === eavesInfo.id}
      >
        <group position={[0, 3.5, 0]}>
          <mesh
            castShadow
            receiveShadow
          >
            <boxGeometry args={[7.5, 0.15, 0.8]} />
            <meshStandardMaterial color={roofTilesColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.1, 0.3]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[7.5, 0.1, 0.1]} />
            <meshStandardMaterial color={decorColor} roughness={0.9} />
          </mesh>
          
          <mesh position={[0, 0, -3.5]}
            rotation={[0, Math.PI, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[7.5, 0.15, 0.8]} />
            <meshStandardMaterial color={roofTilesColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.1, -3.8]}
            rotation={[0, Math.PI, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[7.5, 0.1, 0.1]} />
            <meshStandardMaterial color={decorColor} roughness={0.9} />
          </mesh>
          
          <mesh position={[3.75, 0.2, 0]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[8, 0.15, 0.6]} />
            <meshStandardMaterial color={roofTilesColor} roughness={0.9} />
          </mesh>
          
          <mesh position={[-3.75, 0.2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[8, 0.15, 0.6]} />
            <meshStandardMaterial color={roofTilesColor} roughness={0.9} />
          </mesh>
        </group>
      </ArchitectureComponent>

      <ArchitectureComponent
        componentInfo={mainRidgeInfo}
        onSelect={handleSelect}
        isSelected={selectedComponent === mainRidgeInfo.id}
      >
        <group position={[0, 6.4, 0]}>
          <mesh
            castShadow
            receiveShadow
          >
            <boxGeometry args={[5, 0.35, 0.6]} />
            <meshStandardMaterial color={ridgeColor} roughness={0.9} />
          </mesh>
          
          <mesh position={[0, 0.2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[4.8, 0.15, 0.35]} />
            <meshStandardMaterial color={decorColor} roughness={0.9} />
          </mesh>
          
          <mesh position={[0, 0.1, 0.3]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[5, 0.1, 0.08]} />
            <meshStandardMaterial color={decorColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.1, -0.3]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[5, 0.1, 0.08]} />
            <meshStandardMaterial color={decorColor} roughness={0.9} />
          </mesh>
        </group>
      </ArchitectureComponent>

      <ArchitectureComponent
        componentInfo={ridgeDecorInfo}
        onSelect={handleSelect}
        isSelected={selectedComponent === ridgeDecorInfo.id}
      >
        <group position={[0, 6.6, 0]}>
          <group position={[2.5, 0, 0]}>
            <mesh
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.4, 0.6, 0.4]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.4, 0]}
              castShadow
              receiveShadow
            >
              <coneGeometry args={[0.25, 0.4, 4]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
            <mesh position={[0.1, 0.25, 0.2]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.12, 0.12, 0.25]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
            <mesh position={[-0.1, 0.25, 0.2]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.12, 0.12, 0.25]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
          </group>
          
          <group position={[-2.5, 0, 0]}>
            <mesh
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.4, 0.6, 0.4]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.4, 0]}
              castShadow
              receiveShadow
            >
              <coneGeometry args={[0.25, 0.4, 4]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
            <mesh position={[0.1, 0.25, 0.2]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.12, 0.12, 0.25]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
            <mesh position={[-0.1, 0.25, 0.2]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.12, 0.12, 0.25]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
          </group>
          
          <group position={[0, 0.3, 0]}>
            <mesh
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[0.12, 0.15, 0.35, 8]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.3, 0]}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color={decorColor} roughness={0.85} />
            </mesh>
          </group>
        </group>
      </ArchitectureComponent>

      {pillarsInfo.map((info, index) => {
        const positions: Array<[number, number, number]> = [
          [-2.5, 1.75, -3],
          [2.5, 1.75, -3],
          [-2.5, 1.75, 3],
          [2.5, 1.75, 3],
        ]
        
        return (
          <ArchitectureComponent
            key={info.id}
            componentInfo={info}
            onSelect={handleSelect}
            isSelected={selectedComponent === info.id}
          >
            <Cylinder
              args={[0.18, 0.22, 3.5, 16]}
              position={positions[index]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#DEB887" roughness={0.75} />
            </Cylinder>
            
            <Cylinder
              args={[0.28, 0.3, 0.2, 16]}
              position={[positions[index][0], -0.1, positions[index][2]]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
            </Cylinder>
            
            <Box
              args={[0.55, 0.12, 0.55]}
              position={[positions[index][0], 3.6, positions[index][2]]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={darkWoodColor} roughness={0.9} />
            </Box>
            
            <Box
              args={[0.45, 0.15, 0.45]}
              position={[positions[index][0], 3.75, positions[index][2]]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#A0522D" roughness={0.85} />
            </Box>
          </ArchitectureComponent>
        )
      })}

      <ArchitectureComponent
        componentInfo={stepsInfo}
        onSelect={handleSelect}
        isSelected={selectedComponent === stepsInfo.id}
      >
        <group position={[0, 0, 0]}>
          <Box
            args={[8, 0.25, 3]}
            position={[0, -0.125, -5.5]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#808080" roughness={0.95} />
          </Box>
          
          {[0, 1, 2].map((step) => (
            <Box
              key={step}
              args={[7 - step * 0.4, 0.35, 1.2]}
              position={[0, step * 0.35 + 0.175, -5 + step * 0.4]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#A9A9A9" roughness={0.95} />
            </Box>
          ))}
          
          {[0, 1, 2].map((step) => (
            <Box
              key={`step-${step}`}
              args={[0.1, 0.35, 1.2]}
              position={[-3.5 + step * 0.2, step * 0.35 + 0.175, -5 + step * 0.4]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#696969" roughness={0.95} />
            </Box>
          ))}
          {[0, 1, 2].map((step) => (
            <Box
              key={`step-r-${step}`}
              args={[0.1, 0.35, 1.2]}
              position={[3.5 - step * 0.2, step * 0.35 + 0.175, -5 + step * 0.4]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#696969" roughness={0.95} />
            </Box>
          ))}
        </group>
      </ArchitectureComponent>
    </group>
  )
}
