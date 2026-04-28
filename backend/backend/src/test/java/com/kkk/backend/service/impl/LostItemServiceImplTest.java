package com.kkk.backend.service.impl;

import com.kkk.backend.entity.LostItem;
import com.kkk.backend.repository.LostItemRepository;
import com.kkk.backend.service.LostItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LostItemServiceImplTest {

    @Mock
    private LostItemRepository lostItemRepository;

    @InjectMocks
    private LostItemServiceImpl lostItemService;

    private LostItem testLostItem;
    private Long userId = 1L;
    private Long itemId = 100L;

    @BeforeEach
    void setUp() {
        testLostItem = new LostItem();
        testLostItem.setId(itemId);
        testLostItem.setTitle("丢失的钱包");
        testLostItem.setCategory("钱包");
        testLostItem.setLostLocation("操场");
        testLostItem.setLostTime(LocalDateTime.now());
        testLostItem.setDescription("黑色皮质钱包");
        testLostItem.setUserId(userId);
        testLostItem.setStatus(0);
        testLostItem.setCreateTime(LocalDateTime.now());
    }

    // ==================== 1. createLostItem 测试 ====================

    @Test
    void createLostItem_ShouldSuccess_WhenValidData() {
        LostItem newItem = new LostItem();
        newItem.setTitle("新失物");
        newItem.setCategory("钥匙");
        newItem.setLostLocation("教学楼");

        when(lostItemRepository.save(any(LostItem.class))).thenAnswer(invocation -> {
            LostItem saved = invocation.getArgument(0);
            saved.setId(200L);  // Mock 设置了 id
            return saved;
        });

        LostItem result = lostItemService.createLostItem(newItem, userId);

        assertNotNull(result);
        assertEquals(200L, result.getId());  //  改为期望 200
        assertEquals(userId, result.getUserId());
        assertEquals(0, result.getStatus());
        assertNotNull(result.getCreateTime());
        verify(lostItemRepository, times(1)).save(any(LostItem.class));
    }

    // ==================== 2. updateLostItem 测试 ====================

    @Test
    void updateLostItem_ShouldSuccess_WhenUserIsOwner() {
        // Given
        LostItem updateData = new LostItem();
        updateData.setTitle("更新后标题");
        updateData.setCategory("更新后分类");
        updateData.setLostLocation("更新后位置");

        when(lostItemRepository.findById(itemId)).thenReturn(Optional.of(testLostItem));
        when(lostItemRepository.save(any(LostItem.class))).thenReturn(testLostItem);

        // When
        LostItem result = lostItemService.updateLostItem(itemId, updateData, userId);

        // Then
        assertNotNull(result);
        assertEquals("更新后标题", result.getTitle());
        assertEquals("更新后分类", result.getCategory());
        verify(lostItemRepository, times(1)).findById(itemId);
        verify(lostItemRepository, times(1)).save(any(LostItem.class));
    }

    @Test
    void updateLostItem_ShouldThrowException_WhenItemNotFound() {
        // Given
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> lostItemService.updateLostItem(itemId, new LostItem(), userId));

        assertEquals("失物不存在", exception.getMessage());
    }

    @Test
    void updateLostItem_ShouldThrowException_WhenUserNotOwner() {
        // Given
        Long anotherUserId = 999L;
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.of(testLostItem));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> lostItemService.updateLostItem(itemId, new LostItem(), anotherUserId));

        assertEquals("无权限修改该失物信息", exception.getMessage());
    }

    // ==================== 3. deleteLostItem 测试 ====================

    @Test
    void deleteLostItem_ShouldSuccess_WhenUserIsOwner() {
        // Given
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.of(testLostItem));
        doNothing().when(lostItemRepository).deleteById(itemId);

        // When
        lostItemService.deleteLostItem(itemId, userId);

        // Then
        verify(lostItemRepository, times(1)).deleteById(itemId);
    }

    @Test
    void deleteLostItem_ShouldThrowException_WhenUserNotOwner() {
        // Given
        Long anotherUserId = 999L;
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.of(testLostItem));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> lostItemService.deleteLostItem(itemId, anotherUserId));

        assertEquals("无权限删除该失物", exception.getMessage());
    }

    // ==================== 4. getLostItemById 测试 ====================

    @Test
    void getLostItemById_ShouldReturnItem_WhenExists() {
        // Given
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.of(testLostItem));

        // When
        LostItem result = lostItemService.getLostItemById(itemId);

        // Then
        assertNotNull(result);
        assertEquals("丢失的钱包", result.getTitle());
        verify(lostItemRepository, times(1)).findById(itemId);
    }

    @Test
    void getLostItemById_ShouldThrowException_WhenNotFound() {
        // Given
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> lostItemService.getLostItemById(itemId));

        assertEquals("失物不存在", exception.getMessage());
    }

    // ==================== 5. getLostItemList 测试 ====================

    @Test
    void getLostItemList_ShouldReturnAllItems() {
        // Given
        List<LostItem> items = Arrays.asList(testLostItem);
        when(lostItemRepository.findAll()).thenReturn(items);

        // When
        List<LostItem> result = lostItemService.getLostItemList();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(lostItemRepository, times(1)).findAll();
    }

    @Test
    void getLostItemList_ShouldReturnEmptyList_WhenNoItems() {
        // Given
        when(lostItemRepository.findAll()).thenReturn(Arrays.asList());

        // When
        List<LostItem> result = lostItemService.getLostItemList();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ==================== 6. updateStatus 测试 ====================

    @Test
    void updateStatus_ShouldSuccess_WhenUserIsOwner() {
        // Given
        Integer newStatus = 1; // 已找回
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.of(testLostItem));
        when(lostItemRepository.save(any(LostItem.class))).thenReturn(testLostItem);

        // When
        LostItem result = lostItemService.updateStatus(itemId, newStatus, userId);

        // Then
        assertNotNull(result);
        assertEquals(newStatus, result.getStatus());
        verify(lostItemRepository, times(1)).save(any());
    }

    @Test
    void updateStatus_ShouldThrowException_WhenUserNotOwner() {
        // Given
        Long anotherUserId = 999L;
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.of(testLostItem));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> lostItemService.updateStatus(itemId, 1, anotherUserId));

        assertEquals("无权限更新失物状态", exception.getMessage());
    }

    @Test
    void updateStatus_ShouldThrowException_WhenItemNotFound() {
        // Given
        when(lostItemRepository.findById(itemId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> lostItemService.updateStatus(itemId, 1, userId));

        assertEquals("失物不存在", exception.getMessage());
    }
}