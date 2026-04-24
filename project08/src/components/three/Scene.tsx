import { Box, Plane } from '@react-three/drei'

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Box position={[0, 0.5, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>
      <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="green" />
      </Plane>
    </>
  )
}
