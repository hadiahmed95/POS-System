'use client'

import React, { useState, useEffect } from 'react'
import { DarkButton, LiteButton } from '@/components/button'
import { Square, Circle, LayoutGrid, Users, Clock, Pencil, Save, X } from 'lucide-react'
import { ITable } from '@/app/(user-panel)/type'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'

interface IFloorPlanProps {
  tables: ITable[]
  onTableUpdate: (table: ITable) => void
  onTableClick: (table: ITable) => void
}

interface ITablePosition {
  id: string | number
  x: number
  y: number
  width: number
  height: number
  shape: 'rectangle' | 'circle'
  rotation: number
}

const FloorPlan = ({ tables, onTableUpdate, onTableClick }: IFloorPlanProps) => {
  const [positions, setPositions] = useState<ITablePosition[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [gridSize, setGridSize] = useState(20)
  const [isGridVisible, setIsGridVisible] = useState(false)
  
  // Convert tables to positions on first load
  useEffect(() => {
    if (tables.length > 0 && positions.length === 0) {
      // Try to load saved layout from localStorage
      const savedLayout = localStorage.getItem('restaurant_floor_plan')
      
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout)
          // Verify the saved layout has all current tables
          const hasMissingTables = tables.some(table => 
            !parsedLayout.find((pos: ITablePosition) => pos.id == table.id)
          )
          
          if (!hasMissingTables) {
            setPositions(parsedLayout)
            return
          }
        } catch (error) {
          console.error('Error parsing saved layout:', error)
        }
      }
      
      // Create default layout
      const newPositions: ITablePosition[] = tables.map((table, index) => {
        // Create a grid layout, 3 tables per row
        const row = Math.floor(index / 3)
        const col = index % 3
        
        return {
          id: table.id as string | number,
          x: 100 + (col * 150),
          y: 100 + (row * 150),
          width: 80,
          height: 80,
          shape: Number(table.capacity) <= 4 ? 'circle' : 'rectangle',
          rotation: 0
        }
      })
      
      setPositions(newPositions)
    }
  }, [tables, positions])
  
  // Save positions to localStorage when they change
  useEffect(() => {
    if (positions.length > 0) {
      localStorage.setItem('restaurant_floor_plan', JSON.stringify(positions))
    }
  }, [positions])
  
  const handleMouseDown = (e: React.MouseEvent, tableId: string | number) => {
    if (!isEditMode) return
    
    setSelectedTable(tableId)
    setIsDragging(true)
    
    const tableEl = e.currentTarget as HTMLElement
    const rect = tableEl.getBoundingClientRect()
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    
    e.preventDefault()
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isEditMode || selectedTable === null) return
    
    const floorPlanEl = document.getElementById('floor-plan')
    if (!floorPlanEl) return
    
    const floorPlanRect = floorPlanEl.getBoundingClientRect()
    
    // Calculate new position
    let newX = e.clientX - floorPlanRect.left - dragOffset.x
    let newY = e.clientY - floorPlanRect.top - dragOffset.y
    
    // Snap to grid if grid is enabled
    if (isGridVisible) {
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize
    }
    
    // Update position
    setPositions(positions.map(pos => 
      pos.id === selectedTable
        ? { ...pos, x: newX, y: newY }
        : pos
    ))
    
    e.preventDefault()
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const getTableById = (id: string | number) => {
    return tables.find(t => t.id == id)
  }
  
  const getTablePosition = (id: string | number) => {
    return positions.find(p => p.id == id)
  }
  
  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-500 text-green-800'
      case 'occupied':
        return 'bg-red-100 border-red-500 text-red-800'
      case 'reserved':
        return 'bg-amber-100 border-amber-500 text-amber-800'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800'
    }
  }
  
  const handleRotateTable = (id: string | number) => {
    setPositions(positions.map(pos => 
      pos.id === id
        ? { ...pos, rotation: (pos.rotation + 45) % 360 }
        : pos
    ))
  }
  
  const handleChangeShape = (id: string | number) => {
    setPositions(positions.map(pos => 
      pos.id === id
        ? { ...pos, shape: pos.shape === 'rectangle' ? 'circle' : 'rectangle' }
        : pos
    ))
  }
  
  const handleResizeTable = (id: string | number, sizeChange: number) => {
    setPositions(positions.map(pos => 
      pos.id === id
        ? { 
            ...pos, 
            width: Math.max(40, pos.width + sizeChange),
            height: Math.max(40, pos.height + sizeChange)
          }
        : pos
    ))
  }
  
  const handleSaveLayout = async () => {
    try {
      // Save to localStorage (already done in useEffect)
      
      // Optionally save to backend
      // await fetch(`${BASE_URL}/api/tables/save-layout`, {
      //   method: 'POST',
      //   body: JSON.stringify({ layout: positions })
      // })
      
      toastCustom.success('Floor plan layout saved successfully')
    } catch (error) {
      console.error('Error saving layout:', error)
      toastCustom.error('Error saving floor plan layout')
    }
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Floor Plan</h3>
        
        <div className="flex items-center space-x-2">
          <div className="flex rounded-md overflow-hidden">
            <LiteButton 
              onClick={() => setIsGridVisible(!isGridVisible)}
              className={`!p-2 ${isGridVisible ? 'bg-gray-200' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </LiteButton>
            
            <LiteButton 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`!p-2 ${isEditMode ? 'bg-violet-100 text-violet-800' : ''}`}
            >
              <Pencil className="w-4 h-4" />
            </LiteButton>
          </div>
          
          {isEditMode && (
            <>
              <LiteButton 
                onClick={handleSaveLayout}
                className="!p-2 bg-green-100 text-green-800"
              >
                <Save className="w-4 h-4" />
              </LiteButton>
              
              <LiteButton 
                onClick={() => setIsEditMode(false)}
                className="!p-2 bg-red-100 text-red-800"
              >
                <X className="w-4 h-4" />
              </LiteButton>
            </>
          )}
        </div>
      </div>
      
      {isEditMode && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-md mb-4">
          <p className="text-sm">Edit Mode: Drag tables to position them. Click on a table to modify it.</p>
        </div>
      )}
      
      <div 
        id="floor-plan"
        className={`relative border border-gray-200 rounded-lg h-[600px] overflow-auto ${isGridVisible ? 'bg-grid' : 'bg-gray-50'}`}
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage: isGridVisible ? 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)' : 'none'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Wall elements could be added here */}
        
        {/* Tables */}
        {positions.map(position => {
          const table = getTableById(position.id)
          if (!table) return null
          
          return (
            <div 
              key={position.id}
              className={`absolute cursor-pointer flex items-center justify-center border-2 select-none ${getTableStatusColor(table.status)}`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${position.width}px`,
                height: `${position.height}px`,
                borderRadius: position.shape === 'circle' ? '50%' : '4px',
                transform: `rotate(${position.rotation}deg)`,
                zIndex: selectedTable === position.id ? 10 : 1,
                transition: isDragging && selectedTable === position.id ? 'none' : 'all 0.2s ease'
              }}
              onMouseDown={(e) => handleMouseDown(e, position.id)}
              onClick={() => {
                if (isEditMode) {
                  setSelectedTable(selectedTable === position.id ? null : position.id)
                } else {
                  onTableClick(table)
                }
              }}
            >
              <div className="flex flex-col items-center">
                <span className="font-bold">{table.table_no}</span>
                <div className="flex items-center text-xs">
                  <Users className="w-3 h-3 mr-1" /> {table.capacity}
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Edit controls for selected table */}
        {isEditMode && selectedTable !== null && (
          <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg p-2 z-20 flex flex-col space-y-1"
            style={{
              top: '10px',
              right: '10px',
            }}
          >
            <div className="text-sm font-medium border-b pb-1 mb-1">
              Edit Table {getTableById(selectedTable)?.table_no}
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              <LiteButton 
                onClick={() => handleResizeTable(selectedTable, -10)}
                className="!p-1 !text-xs"
              >
                Size -
              </LiteButton>
              
              <LiteButton 
                onClick={() => handleResizeTable(selectedTable, 10)}
                className="!p-1 !text-xs"
              >
                Size +
              </LiteButton>
              
              <LiteButton 
                onClick={() => handleRotateTable(selectedTable)}
                className="!p-1 !text-xs"
              >
                Rotate
              </LiteButton>
              
              <LiteButton 
                onClick={() => handleChangeShape(selectedTable)}
                className="!p-1 !text-xs"
              >
                Shape
              </LiteButton>
            </div>
            
            <LiteButton 
              onClick={() => setSelectedTable(null)}
              className="!p-1 !text-xs bg-gray-100 mt-1"
            >
              Close
            </LiteButton>
          </div>
        )}
      </div>
      
      {/* Table status legend */}
      <div className="flex space-x-4 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  )
}

export default FloorPlan