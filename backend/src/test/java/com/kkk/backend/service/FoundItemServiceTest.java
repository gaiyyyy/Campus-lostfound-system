package com.kkk.backend.service;

import com.kkk.backend.entity.FoundItem;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.FoundItemRepository;
import com.kkk.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoundItemServiceTest {

    @Mock
    private FoundItemRepository foundItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FoundItemService foundItemService;

    private FoundItem testFoundItem;
    private User testUser;
    private Long userId = 1L;
    private Long itemId = 100L;

    @BeforeEach
    void setUp() {
        // 初始化测试数据
        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("测试用户");
        testUser.setContact("13800138000");

        testFoundItem = new FoundItem();
        testFoundItem.setId(itemId);
        testFoundItem.setTitle("测试失物");
        testFoundItem.setCategory("电子产品");
        testFoundItem.setFoundLocation("图书馆");
        testFoundItem.setFoundTime(LocalDateTime.now());
        testFoundItem.setDescription("一部黑色手机");
        testFoundItem.setUserId(userId);
        testFoundItem.setStatus(0);
        testFoundItem.setCreateTime(LocalDateTime.now());
    }

    // ==================== 1. createFoundItem 测试 ====================

    @Test
    void createFoundItem_ShouldSuccess_WhenValidData() {
        // Given
        FoundItem newItem = new FoundItem();
        newItem.setTitle("新失物");
        newItem.setCategory("证件");
        newItem.setFoundLocation("食堂");

        when(foundItemRepository.save(any(FoundItem.class))).thenAnswer(invocation -> {
            FoundItem saved = invocation.getArgument(0);
            saved.setId(200L);
            return saved;
        });

        // When
        FoundItem result = foundItemService.createFoundItem(newItem, userId);

        // Then
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(0, result.getStatus());
        assertNotNull(result.getCreateTime());
        verify(foundItemRepository, times(1)).save(any(FoundItem.class));
    }

    // ==================== 2. updateFoundItem 测试 ====================

    @Test
    void updateFoundItem_ShouldSuccess_WhenUserIsOwner() {
        // Given
        FoundItem updateData = new FoundItem();
        updateData.setTitle("更新后的标题");
        updateData.setCategory("更新后分类");
        updateData.setFoundLocation("更新后位置");

        when(foundItemRepository.findById(itemId)).thenReturn(Optional.of(testFoundItem));
        when(foundItemRepository.save(any(FoundItem.class))).thenReturn(testFoundItem);

        // When
        FoundItem result = foundItemService.updateFoundItem(itemId, updateData, userId);

        // Then
        assertNotNull(result);
        assertEquals("更新后的标题", result.getTitle());
        assertEquals("更新后分类", result.getCategory());
        verify(foundItemRepository, times(1)).findById(itemId);
        verify(foundItemRepository, times(1)).save(any(FoundItem.class));
    }

    @Test
    void updateFoundItem_ShouldThrowException_WhenItemNotFound() {
        // Given
        when(foundItemRepository.findById(itemId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> foundItemService.updateFoundItem(itemId, new FoundItem(), userId));

        assertEquals("招领信息不存在", exception.getMessage());
        verify(foundItemRepository, never()).save(any());
    }

    @Test
    void updateFoundItem_ShouldThrowException_WhenUserNotOwner() {
        // Given
        Long anotherUserId = 999L;
        when(foundItemRepository.findById(itemId)).thenReturn(Optional.of(testFoundItem));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> foundItemService.updateFoundItem(itemId, new FoundItem(), anotherUserId));

        assertEquals("无权限修改", exception.getMessage());
        verify(foundItemRepository, never()).save(any());
    }

    // ==================== 3. deleteFoundItem 测试 ====================

    @Test
    void deleteFoundItem_ShouldSuccess_WhenUserIsOwner() {
        // Given
        when(foundItemRepository.findById(itemId)).thenReturn(Optional.of(testFoundItem));
        doNothing().when(foundItemRepository).deleteById(itemId);

        // When
        foundItemService.deleteFoundItem(itemId, userId);

        // Then
        verify(foundItemRepository, times(1)).deleteById(itemId);
    }

    @Test
    void deleteFoundItem_ShouldThrowException_WhenUserNotOwner() {
        // Given
        Long anotherUserId = 999L;
        when(foundItemRepository.findById(itemId)).thenReturn(Optional.of(testFoundItem));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> foundItemService.deleteFoundItem(itemId, anotherUserId));

        assertEquals("无权限删除", exception.getMessage());
        verify(foundItemRepository, never()).deleteById(any());
    }

    // ==================== 4. getFoundItemById 测试 ====================

    @Test
    void getFoundItemById_ShouldReturnItemWithPublisherInfo_WhenExists() {
        // Given
        when(foundItemRepository.findById(itemId)).thenReturn(Optional.of(testFoundItem));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // When
        FoundItem result = foundItemService.getFoundItemById(itemId);

        // Then
        assertNotNull(result);
        assertEquals("测试用户", result.getPublisherName());
        assertEquals("13800138000", result.getContact());
        verify(foundItemRepository, times(1)).findById(itemId);
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    void getFoundItemById_ShouldReturnNull_WhenItemNotFound() {
        // Given
        when(foundItemRepository.findById(itemId)).thenReturn(Optional.empty());

        // When
        FoundItem result = foundItemService.getFoundItemById(itemId);

        // Then
        assertNull(result);
    }

    // ==================== 5. updateStatus 测试 ====================

    @Test
    void updateStatus_ShouldSuccess_WhenUserIsOwner() {
        // Given
        Integer newStatus = 1; // 已认领
        when(foundItemRepository.findById(itemId)).thenReturn(Optional.of(testFoundItem));
        when(foundItemRepository.save(any(FoundItem.class))).thenReturn(testFoundItem);

        // When
        FoundItem result = foundItemService.updateStatus(itemId, newStatus, userId);

        // Then
        assertNotNull(result);
        assertEquals(newStatus, result.getStatus());
        verify(foundItemRepository, times(1)).save(any());
    }

    @Test
    void updateStatus_ShouldThrowException_WhenUserNotOwner() {
        // Given
        Long anotherUserId = 999L;
        when(foundItemRepository.findById(itemId)).thenReturn(Optional.of(testFoundItem));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> foundItemService.updateStatus(itemId, 1, anotherUserId));

        assertEquals("无权限操作", exception.getMessage());
    }

    // ==================== 6. getUserFoundItems 测试 ====================

    @Test
    void getUserFoundItems_ShouldReturnList_WhenUserHasItems() {
        // Given
        List<FoundItem> items = Arrays.asList(testFoundItem);
        when(foundItemRepository.findByUserIdOrderByCreateTimeDesc(userId)).thenReturn(items);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // When
        List<FoundItem> result = foundItemService.getUserFoundItems(userId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("测试用户", result.get(0).getPublisherName());
    }

    @Test
    void getUserFoundItems_ShouldReturnEmptyList_WhenUserHasNoItems() {
        // Given
        when(foundItemRepository.findByUserIdOrderByCreateTimeDesc(userId)).thenReturn(Arrays.asList());

        // When
        List<FoundItem> result = foundItemService.getUserFoundItems(userId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ==================== 7. getAllFoundItems 测试 ====================

    @Test
    void getAllFoundItems_ShouldReturnAllItems() {
        // Given
        List<FoundItem> items = Arrays.asList(testFoundItem);
        when(foundItemRepository.findAll()).thenReturn(items);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // When
        List<FoundItem> result = foundItemService.getAllFoundItems();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // ==================== 8. getTotalCount 测试 ====================

    @Test
    void getTotalCount_ShouldReturnCorrectCount() {
        // Given
        when(foundItemRepository.countTotal()).thenReturn(5L);

        // When
        long count = foundItemService.getTotalCount();

        // Then
        assertEquals(5L, count);
        verify(foundItemRepository, times(1)).countTotal();
    }

    // ==================== 9. getFoundItemsPage 测试 ====================

    @Test
    void getFoundItemsPage_ShouldReturnPagedResults() {
        // Given
        Page<FoundItem> page = new PageImpl<>(Arrays.asList(testFoundItem));
        when(foundItemRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // When
        Page<FoundItem> result = foundItemService.getFoundItemsPage("手机", "电子产品", 0, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(foundItemRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
    }
}