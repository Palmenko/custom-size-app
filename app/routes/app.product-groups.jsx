import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useState } from "react";

export async function loader({ request }) {
  await authenticate.admin(request);
  
  try {
    // Получаем группы товаров
    const productGroupsResponse = await fetch(`${request.url.split('/app')[0]}/api/product-groups`);
    const productGroupsData = await productGroupsResponse.json();
    
    // Получаем все мерки для выбора
    const measurementsResponse = await fetch(`${request.url.split('/app')[0]}/api/measurements`);
    const measurementsData = await measurementsResponse.json();
    
    return json({
      productGroups: productGroupsData.productGroups || [],
      measurements: measurementsData.measurements || []
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    return json({
      productGroups: [],
      measurements: []
    });
  }
}

export default function ProductGroups() {
  const { productGroups, measurements } = useLoaderData();
  const [editingGroup, setEditingGroup] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMeasurements, setSelectedMeasurements] = useState([]);
  const submit = useSubmit();

  const groupTypes = [
    { value: 'tag', label: 'Тег товара' },
    { value: 'template', label: 'Темплейт товара' },
    { value: 'type', label: 'Тип товара' },
    { value: 'vendor', label: 'Вендор' },
    { value: 'collection', label: 'Коллекция' }
  ];

  const handleCreateGroup = (formData) => {
    const data = {
      action: 'create',
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      value: formData.get('value'),
      sortOrder: formData.get('sortOrder') || '0'
    };
    
    submit(data, { method: 'post', action: '/api/product-groups' });
    setShowCreateForm(false);
  };

  const handleUpdateGroup = (formData) => {
    const data = {
      action: 'update',
      id: editingGroup.id,
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      value: formData.get('value'),
      sortOrder: formData.get('sortOrder') || '0',
      active: formData.get('active') === 'on'
    };
    
    submit(data, { method: 'post', action: '/api/product-groups' });
    setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId) => {
    if (confirm('Вы уверены, что хотите удалить эту группу?')) {
      const data = {
        action: 'delete',
        id: groupId
      };
      
      submit(data, { method: 'post', action: '/api/product-groups' });
    }
  };

  const handleUpdateMeasurements = (groupId) => {
    const data = {
      action: 'update-measurements',
      productGroupId: groupId,
      measurements: JSON.stringify(selectedMeasurements)
    };
    
    submit(data, { method: 'post', action: '/api/product-groups' });
    setSelectedMeasurements([]);
  };

  const toggleMeasurement = (measurementId, required = false) => {
    setSelectedMeasurements(prev => {
      const existing = prev.find(m => m.measurementId === measurementId);
      if (existing) {
        return prev.filter(m => m.measurementId !== measurementId);
      } else {
        return [...prev, { measurementId, required, sortOrder: prev.length }];
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Группы товаров</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Создать группу
        </button>
      </div>

      {/* Форма создания группы */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">Создать новую группу</h2>
          <Form method="post" action="/api/product-groups" onSubmit={(e) => {
            e.preventDefault();
            handleCreateGroup(new FormData(e.target));
          }}>
            <input type="hidden" name="action" value="create" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название группы</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Тип группы</label>
                <select name="type" required className="w-full border rounded px-3 py-2">
                  <option value="">Выберите тип</option>
                  {groupTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Значение</label>
                <input
                  type="text"
                  name="value"
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Например: платье, футболка, джинсы"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <input
                  type="text"
                  name="description"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Создать
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Отмена
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Список групп */}
      <div className="space-y-4">
        {productGroups.map(group => (
          <div key={group.id} className="border rounded p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-gray-600">{group.description}</p>
                <p className="text-sm text-gray-500">
                  Тип: {groupTypes.find(t => t.value === group.type)?.label} | 
                  Значение: {group.value}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingGroup(group)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>

            {/* Мерки группы */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Мерки группы:</h4>
              {group.groupMeasurements.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {group.groupMeasurements.map(gm => (
                    <div key={gm.id} className="text-sm">
                      • {gm.measurement.name} {gm.required && '(обязательная)'}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Мерки не настроены</p>
              )}
            </div>

            {/* Настройка мерок */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Настроить мерки:</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {measurements.map(measurement => {
                  const isSelected = selectedMeasurements.find(m => m.measurementId === measurement.id);
                  const isInGroup = group.groupMeasurements.find(gm => gm.measurementId === measurement.id);
                  
                  return (
                    <label key={measurement.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected || isInGroup}
                        onChange={() => toggleMeasurement(measurement.id)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {measurement.name}
                        {isInGroup && isInGroup.required && ' (обязательная)'}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedMeasurements.length > 0 && (
                <button
                  onClick={() => handleUpdateMeasurements(group.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Сохранить мерки
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно редактирования */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Редактировать группу</h2>
            <Form method="post" action="/api/product-groups" onSubmit={(e) => {
              e.preventDefault();
              handleUpdateGroup(new FormData(e.target));
            }}>
              <input type="hidden" name="action" value="update" />
              <input type="hidden" name="id" value={editingGroup.id} />
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название группы</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingGroup.name}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Тип группы</label>
                  <select name="type" required className="w-full border rounded px-3 py-2">
                    {groupTypes.map(type => (
                      <option 
                        key={type.value} 
                        value={type.value}
                        selected={type.value === editingGroup.type}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Значение</label>
                  <input
                    type="text"
                    name="value"
                    defaultValue={editingGroup.value}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Описание</label>
                  <input
                    type="text"
                    name="description"
                    defaultValue={editingGroup.description || ''}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={editingGroup.active}
                      className="mr-2"
                    />
                    <span className="text-sm">Активна</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Отмена
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
} 