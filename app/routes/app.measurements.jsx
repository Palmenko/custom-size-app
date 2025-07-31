import { useState, useEffect } from "react";
// import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  Select,
  Checkbox,
  Modal,
  DataTable,
  Badge,
  ButtonGroup,
  Toast,
  Frame,
  Tabs
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { EditIcon, DeleteIcon, PlusIcon } from "@shopify/polaris-icons";

export async function loader({ request }) {
  await authenticate.admin(request);
  return null;
}

export default function MeasurementsPage() {
  // const fetcher = useFetcher();
  const [measurements, setMeasurements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "см",
    minValue: 0,
    maxValue: 200,
    step: 1,
    required: false,
    active: true,
    sortOrder: 0
  });
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Состояние для групп товаров
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
    type: "tag",
    value: "",
    sortOrder: 0,
    active: true
  });
    const [selectedMeasurements, setSelectedMeasurements] = useState([]);
  const [availableMeasurements, setAvailableMeasurements] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [productGroups, setProductGroups] = useState([]);
  
  // Константы для типов групп
  const groupTypes = [
    { value: 'tag', label: 'Тег товара' },
    { value: 'template', label: 'Темплейт товара' },
    { value: 'type', label: 'Тип товара' },
    { value: 'vendor', label: 'Вендор' },
    { value: 'collection', label: 'Коллекция' }
  ];
  
  // Загрузка мерок при монтировании компонента
  useEffect(() => {
    loadMeasurements();
    loadProductGroups();
  }, []);

  const loadMeasurements = async () => {
    const response = await fetch("/api/measurements");
    const data = await response.json();
    if (data.measurements) {
      setMeasurements(data.measurements);
      setAvailableMeasurements(data.measurements);
    }
  };

  const loadProductGroups = async () => {
    try {
      const response = await fetch("/api/product-groups");
      const data = await response.json();
      if (data.productGroups) {
        setProductGroups(data.productGroups);
      }
    } catch (error) {
      console.error('Ошибка при загрузке групп товаров:', error);
    }
  };

  const handleGroupInputChange = (field, value) => {
    setGroupFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMeasurementToggle = (measurementId, required = false) => {
    setSelectedMeasurements(prev => {
      const existing = prev.find(m => m.measurementId === measurementId);
      if (existing) {
        return prev.filter(m => m.measurementId !== measurementId);
      } else {
        return [...prev, { measurementId, required, sortOrder: prev.length }];
      }
    });
  };

  const handleCreateGroup = async () => {
    try {
      // Определяем, создаем новую группу или обновляем существующую
      const isEditing = groupFormData.id;
      
      const formData = new FormData();
      formData.append('action', isEditing ? 'update' : 'create');
      if (isEditing) {
        formData.append('id', groupFormData.id.toString());
      }
      formData.append('name', groupFormData.name);
      formData.append('description', groupFormData.description);
      formData.append('type', groupFormData.type);
      formData.append('value', groupFormData.value);
      formData.append('sortOrder', groupFormData.sortOrder.toString());
      formData.append('active', groupFormData.active.toString());

      const groupResponse = await fetch("/api/product-groups", {
        method: "POST",
        body: formData,
      });

      const groupResult = await groupResponse.json();
      
      if (groupResult.error) {
        setToastMessage(`Ошибка при создании группы: ${groupResult.error}`);
        setToastActive(true);
        return;
      }

      // Затем добавляем мерки к группе
      if (selectedMeasurements.length > 0) {
        const measurementsFormData = new FormData();
        measurementsFormData.append('action', 'update-measurements');
        measurementsFormData.append('productGroupId', groupResult.productGroup.id.toString());
        measurementsFormData.append('measurements', JSON.stringify(selectedMeasurements));

        const measurementsResponse = await fetch("/api/product-groups", {
          method: "POST",
          body: measurementsFormData,
        });

        const measurementsResult = await measurementsResponse.json();
        
        if (measurementsResult.error) {
          setToastMessage(`Группа создана, но ошибка при добавлении мерок: ${measurementsResult.error}`);
          setToastActive(true);
          return;
        }
      }

      setToastMessage(isEditing ? "Группа товаров обновлена успешно!" : "Группа товаров создана успешно!");
      setToastActive(true);
      handleCloseGroupModal();
      loadProductGroups(); // Перезагружаем список групп
      
    } catch (error) {
      console.error('Ошибка при создании группы:', error);
      setToastMessage(`Ошибка при создании группы: ${error.message}`);
      setToastActive(true);
    }
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setGroupFormData({
      id: null,
      name: "",
      description: "",
      type: "tag",
      value: "",
      sortOrder: 0,
      active: true
    });
    setSelectedMeasurements([]);
  };

  const handleEditGroup = (group) => {
    setGroupFormData({
      id: group.id,
      name: group.name,
      description: group.description || "",
      type: group.type,
      value: group.value,
      sortOrder: group.sortOrder,
      active: group.active
    });
    
    // Загружаем мерки группы
    const groupMeasurements = group.groupMeasurements.map(gm => ({
      measurementId: gm.measurementId,
      required: gm.required,
      sortOrder: gm.sortOrder
    }));
    setSelectedMeasurements(groupMeasurements);
    
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = async (groupId) => {
    if (confirm('Вы уверены, что хотите удалить эту группу?')) {
      try {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', groupId.toString());

        const response = await fetch("/api/product-groups", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        
        if (result.error) {
          setToastMessage(`Ошибка при удалении группы: ${result.error}`);
          setToastActive(true);
        } else {
          setToastMessage("Группа удалена успешно!");
          setToastActive(true);
          loadProductGroups();
        }
      } catch (error) {
        console.error('Ошибка при удалении группы:', error);
        setToastMessage(`Ошибка при удалении группы: ${error.message}`);
        setToastActive(true);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    const url = editingMeasurement 
      ? "/api/measurements" 
      : "/api/measurements";
    
    const method = editingMeasurement ? "PUT" : "POST";
    
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingMeasurement ? { ...formData, id: editingMeasurement.id } : formData),
    });

    const result = await response.json();
    
    if (result.error) {
      setToastMessage(`Ошибка: ${result.error}`);
      setToastActive(true);
    } else {
      setToastMessage(editingMeasurement ? "Мерка обновлена!" : "Мерка создана!");
      setToastActive(true);
      handleCloseModal();
      loadMeasurements();
    }
  };

  const handleEdit = (measurement) => {
    setEditingMeasurement(measurement);
    setFormData({
      name: measurement.name,
      description: measurement.description || "",
      unit: measurement.unit,
      minValue: measurement.minValue,
      maxValue: measurement.maxValue,
      step: measurement.step,
      required: measurement.required,
      active: measurement.active,
      sortOrder: measurement.sortOrder
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Вы уверены, что хотите удалить эту мерку?")) {
      const response = await fetch(`/api/measurements?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      
      if (result.error) {
        setToastMessage(`Ошибка: ${result.error}`);
        setToastActive(true);
      } else {
        setToastMessage("Мерка удалена!");
        setToastActive(true);
        loadMeasurements();
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeasurement(null);
    setFormData({
      name: "",
      description: "",
      unit: "см",
      minValue: 0,
      maxValue: 200,
      step: 1,
      required: false,
      active: true,
      sortOrder: 0
    });
  };

  const rows = measurements && measurements.length > 0 ? measurements.map((measurement) => [
    measurement.name,
    measurement.description || "-",
    `${measurement.minValue} - ${measurement.maxValue} ${measurement.unit}`,
    measurement.step.toString(),
    <Badge key={`required-${measurement.id}`} tone={measurement.required ? "critical" : "info"}>
      {measurement.required ? "Обязательная" : "Необязательная"}
    </Badge>,
    <Badge key={`active-${measurement.id}`} tone={measurement.active ? "success" : "warning"}>
      {measurement.active ? "Активна" : "Неактивна"}
    </Badge>,
    measurement.sortOrder.toString(),
    <ButtonGroup key={`actions-${measurement.id}`}>
      <Button
        icon={EditIcon}
        onClick={() => handleEdit(measurement)}
        size="micro"
      >
        Редактировать
      </Button>
      <Button
        icon={DeleteIcon}
        onClick={() => handleDelete(measurement.id)}
        size="micro"
        tone="critical"
      >
        Удалить
      </Button>
    </ButtonGroup>
  ]) : [];

  return (
    <Frame>
      <Page title="Управление мерками">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Tabs
                  tabs={[
                    {
                      id: 'measurements',
                      content: 'Мерки',
                      accessibilityLabel: 'Мерки',
                      panelID: 'measurements-panel',
                    },
                    {
                      id: 'groups',
                      content: 'Группы товаров',
                      accessibilityLabel: 'Группы товаров',
                      panelID: 'groups-panel',
                    },
                  ]}
                  selected={selectedTab}
                  onSelect={setSelectedTab}
                >
                  {selectedTab === 0 && (
                    <div id="measurements-panel">
                      <BlockStack gap="400">
                        <InlineStack align="space-between">
                          <Text as="h2" variant="headingMd">
                            Список мерок
                          </Text>
                          <Button
                            primary
                            onClick={() => setIsModalOpen(true)}
                            icon={PlusIcon}
                          >
                            Добавить мерку
                          </Button>
                        </InlineStack>
                        {measurements && measurements.length > 0 ? (
                          <DataTable
                            columnContentTypes={[
                              'text',
                              'text',
                              'text',
                              'text',
                              'text',
                              'text',
                              'text',
                              'text',
                            ]}
                            headings={[
                              'Название',
                              'Описание',
                              'Диапазон',
                              'Шаг',
                              'Обязательность',
                              'Статус',
                              'Порядок',
                              'Действия',
                            ]}
                            rows={rows}
                          />
                        ) : (
                          <Card>
                            <BlockStack gap="400" align="center">
                              <Text variant="bodyMd" as="p" tone="subdued">
                                Мерки не найдены. Создайте первую мерку, нажав кнопку "Добавить мерку".
                              </Text>
                            </BlockStack>
                          </Card>
                        )}
                      </BlockStack>
                    </div>
                  )}
                  
                  {selectedTab === 1 && (
                    <div id="groups-panel">
                      <BlockStack gap="400">
                        <InlineStack align="space-between">
                          <Text as="h2" variant="headingMd">
                            Группы товаров
                          </Text>
                          <Button
                            primary
                            onClick={() => setIsGroupModalOpen(true)}
                            icon={PlusIcon}
                          >
                            Добавить таблицу мерок
                          </Button>
                        </InlineStack>
                        <Text variant="bodyMd" as="p">
                          Создайте группы товаров и назначьте им мерки для автоматического отображения на страницах товаров
                        </Text>
                        
                        {productGroups && productGroups.length > 0 ? (
                          <DataTable
                            columnContentTypes={[
                              'text',
                              'text',
                              'text',
                              'text',
                              'text',
                              'text',
                              'text',
                            ]}
                            headings={[
                              'Название',
                              'Описание',
                              'Тип',
                              'Значение',
                              'Мерки',
                              'Статус',
                              'Действия',
                            ]}
                            rows={productGroups.map((group, index) => [
                              group.name,
                              group.description || '-',
                              groupTypes.find(t => t.value === group.type)?.label || group.type,
                              group.value,
                              `${group.groupMeasurements?.length || 0} мерок`,
                              <Badge key={`group-active-${group.id}`} tone={group.active ? "success" : "warning"}>
                                {group.active ? "Активна" : "Неактивна"}
                              </Badge>,
                              <ButtonGroup key={group.id}>
                                <Button
                                  size="slim"
                                  onClick={() => handleEditGroup(group)}
                                  icon={EditIcon}
                                >
                                  Редактировать
                                </Button>
                                <Button
                                  size="slim"
                                  tone="critical"
                                  onClick={() => handleDeleteGroup(group.id)}
                                  icon={DeleteIcon}
                                >
                                  Удалить
                                </Button>
                              </ButtonGroup>,
                            ])}
                          />
                        ) : (
                          <Card>
                            <BlockStack gap="400" align="center">
                              <Text variant="bodyMd" as="p" tone="subdued">
                                Группы товаров не найдены. Создайте первую группу, нажав кнопку "Добавить таблицу мерок".
                              </Text>
                            </BlockStack>
                          </Card>
                        )}
                      </BlockStack>
                    </div>
                  )}
                </Tabs>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          title={editingMeasurement ? "Редактировать мерку" : "Добавить мерку"}
          primaryAction={{
            content: editingMeasurement ? "Сохранить" : "Создать",
            onAction: handleSubmit,
          }}
          secondaryActions={[
            {
              content: "Отмена",
              onAction: handleCloseModal,
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <TextField
                label="Название мерки"
                value={formData.name}
                onChange={(value) => handleInputChange("name", value)}
                autoComplete="off"
                required
              />
              
              <TextField
                label="Описание"
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                autoComplete="off"
                multiline={3}
              />
              
              <InlineStack gap="400">
                <TextField
                  label="Единица измерения"
                  value={formData.unit}
                  onChange={(value) => handleInputChange("unit", value)}
                  autoComplete="off"
                />
                
                <TextField
                  label="Минимальное значение"
                  type="number"
                  value={formData.minValue.toString()}
                  onChange={(value) => handleInputChange("minValue", parseInt(value) || 0)}
                  autoComplete="off"
                />
                
                <TextField
                  label="Максимальное значение"
                  type="number"
                  value={formData.maxValue.toString()}
                  onChange={(value) => handleInputChange("maxValue", parseInt(value) || 0)}
                  autoComplete="off"
                />
              </InlineStack>
              
              <InlineStack gap="400">
                <TextField
                  label="Шаг измерения"
                  type="number"
                  value={formData.step.toString()}
                  onChange={(value) => handleInputChange("step", parseInt(value) || 1)}
                  autoComplete="off"
                />
                
                <TextField
                  label="Порядок сортировки"
                  type="number"
                  value={formData.sortOrder.toString()}
                  onChange={(value) => handleInputChange("sortOrder", parseInt(value) || 0)}
                  autoComplete="off"
                />
              </InlineStack>
              
              <InlineStack gap="400">
                <Checkbox
                  label="Обязательная мерка"
                  checked={formData.required}
                  onChange={(checked) => handleInputChange("required", checked)}
                />
                
                <Checkbox
                  label="Активна"
                  checked={formData.active}
                  onChange={(checked) => handleInputChange("active", checked)}
                />
              </InlineStack>
            </BlockStack>
          </Modal.Section>
        </Modal>

        <Modal
          open={isGroupModalOpen}
          onClose={handleCloseGroupModal}
          title={groupFormData.name ? "Редактировать группу товаров" : "Добавить таблицу мерок"}
          primaryAction={{
            content: groupFormData.name ? "Сохранить изменения" : "Добавить группу",
            onAction: handleCreateGroup,
          }}
          secondaryActions={[
            {
              content: "Отмена",
              onAction: handleCloseGroupModal,
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h3">
                Настройки группы товаров
              </Text>
              
              <TextField
                label="Название группы"
                value={groupFormData.name}
                onChange={(value) => handleGroupInputChange("name", value)}
                autoComplete="off"
                required
              />
              
              <TextField
                label="Описание группы"
                value={groupFormData.description}
                onChange={(value) => handleGroupInputChange("description", value)}
                autoComplete="off"
                multiline={2}
              />
              
              <Select
                label="Тип группы"
                options={groupTypes.map(type => ({
                  label: type.label,
                  value: type.value
                }))}
                value={groupFormData.type}
                onChange={(value) => handleGroupInputChange("type", value)}
              />
              
              <TextField
                label="Значение"
                value={groupFormData.value}
                onChange={(value) => handleGroupInputChange("value", value)}
                autoComplete="off"
                required
                helpText="Например: платье, футболка, джинсы или название категории/коллекции"
              />
              
              <TextField
                label="Порядок сортировки"
                type="number"
                value={groupFormData.sortOrder.toString()}
                onChange={(value) => handleGroupInputChange("sortOrder", parseInt(value) || 0)}
                autoComplete="off"
              />
              
              <Checkbox
                label="Активна"
                checked={groupFormData.active}
                onChange={(checked) => handleGroupInputChange("active", checked)}
              />
            </BlockStack>
          </Modal.Section>
          
          <Modal.Section>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h3">
                Выбор мерок для группы
              </Text>
              
              <Text variant="bodyMd" as="p">
                Выберите мерки, которые будут отображаться для товаров этой группы:
              </Text>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <BlockStack gap="200">
                  {availableMeasurements.map((measurement, index) => {
                    const isSelected = selectedMeasurements.find(m => m.measurementId === measurement.id);
                    const isRequired = isSelected?.required || false;
                    
                    return (
                      <Card key={`${measurement.id}-${index}`}>
                        <BlockStack gap="200">
                          <InlineStack align="space-between">
                            <Checkbox
                              key={`checkbox-${measurement.id}`}
                              label={measurement.name}
                              checked={!!isSelected}
                              onChange={(checked) => handleMeasurementToggle(measurement.id, isRequired)}
                            />
                            {isSelected && (
                              <Checkbox
                                key={`required-${measurement.id}`}
                                label="Обязательная"
                                checked={isRequired}
                                onChange={(checked) => {
                                  if (isSelected) {
                                    setSelectedMeasurements(prev => 
                                      prev.map(m => 
                                        m.measurementId === measurement.id 
                                          ? { ...m, required: checked }
                                          : m
                                      )
                                    );
                                  }
                                }}
                              />
                            )}
                          </InlineStack>
                          
                          {measurement.description && (
                            <Text variant="bodySm" as="p" tone="subdued">
                              {measurement.description}
                            </Text>
                          )}
                          
                          <Text variant="bodySm" as="p">
                            Диапазон: {measurement.minValue} - {measurement.maxValue} {measurement.unit}
                          </Text>
                        </BlockStack>
                      </Card>
                    );
                  })}
                </BlockStack>
              </div>
              
              {selectedMeasurements.length > 0 && (
                <Text variant="bodyMd" as="p" tone="success">
                  Выбрано мерок: {selectedMeasurements.length} 
                  (Обязательных: {selectedMeasurements.filter(m => m.required).length})
                </Text>
              )}
            </BlockStack>
          </Modal.Section>
        </Modal>

        {toastActive && (
          <Toast
            content={toastMessage}
            onDismiss={() => setToastActive(false)}
            duration={4000}
          />
        )}
      </Page>
    </Frame>
  );
}