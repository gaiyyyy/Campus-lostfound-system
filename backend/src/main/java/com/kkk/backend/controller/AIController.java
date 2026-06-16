package com.kkk.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kkk.backend.entity.FoundItem;
import com.kkk.backend.entity.LostItem;
import com.kkk.backend.service.FoundItemService;
import com.kkk.backend.service.LostItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    @Autowired
    private LostItemService lostItemService;

    @Autowired
    private FoundItemService foundItemService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.api.url}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/match-lost/{lostId}")
    public Map<String, Object> matchLostToFound(@PathVariable Long lostId) {
        Map<String, Object> result = new HashMap<>();

        try {
            LostItem lost = lostItemService.getLostItemById(lostId);
            if (lost == null) {
                result.put("success", false);
                result.put("message", "失物不存在");
                return result;
            }

            List<FoundItem> foundList = foundItemService.getAllFoundItems();
            if (foundList.isEmpty()) {
                result.put("success", false);
                result.put("message", "暂无招领信息");
                return result;
            }

            String prompt = buildMatchPrompt(lost, foundList);
            String aiResponse = callDeepSeek(prompt);

            result.put("success", true);
            result.put("prompt", prompt);
            result.put("aiResponse", aiResponse);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "AI匹配失败：" + e.getMessage());
        }

        return result;
    }

    @PostMapping("/match-found/{foundId}")
    public Map<String, Object> matchFoundToLost(@PathVariable Long foundId) {
        Map<String, Object> result = new HashMap<>();

        try {
            FoundItem found = foundItemService.getFoundItemById(foundId);
            if (found == null) {
                result.put("success", false);
                result.put("message", "招领信息不存在");
                return result;
            }

            List<LostItem> lostList = lostItemService.getLostItemList();
            if (lostList.isEmpty()) {
                result.put("success", false);
                result.put("message", "暂无失物信息");
                return result;
            }

            String prompt = buildReverseMatchPrompt(found, lostList);
            String aiResponse = callDeepSeek(prompt);

            result.put("success", true);
            result.put("aiResponse", aiResponse);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "AI匹配失败：" + e.getMessage());
        }

        return result;
    }

    private String buildMatchPrompt(LostItem lost, List<FoundItem> foundList) {
        StringBuilder sb = new StringBuilder();
        sb.append("你是一个校园失物招领系统的智能匹配助手。\n");
        sb.append("用户丢失了以下物品，请从捡到的物品列表中找出最匹配的。\n\n");

        sb.append("【丢失物品信息】\n");
        sb.append("- 标题：").append(lost.getTitle()).append("\n");
        sb.append("- 类别：").append(lost.getCategory() != null ? lost.getCategory() : "未知").append("\n");
        sb.append("- 丢失地点：").append(lost.getLostLocation() != null ? lost.getLostLocation() : "未知").append("\n");
        sb.append("- 描述：").append(lost.getDescription() != null ? lost.getDescription() : "无").append("\n\n");

        sb.append("【捡到的物品列表】\n");
        for (int i = 0; i < Math.min(foundList.size(), 15); i++) {
            FoundItem found = foundList.get(i);
            sb.append(i + 1).append(". ID:").append(found.getId())
                    .append(" | 标题：").append(found.getTitle())
                    .append(" | 类别：").append(found.getCategory())
                    .append(" | 地点：").append(found.getFoundLocation())
                    .append(" | 描述：").append(found.getDescription() != null ? found.getDescription() : "无")
                    .append("\n");
        }

        sb.append("\n请分析以上捡到的物品，找出最可能是用户丢失的那几件。");
        sb.append("返回格式：JSON数组，每个元素包含 id（捡到物品ID）、score（匹配度0-100）、reason（匹配理由）。");
        sb.append("按匹配度从高到低排序，最多返回3条。只返回JSON，不要有其他解释文字。");
        return sb.toString();
    }

    private String buildReverseMatchPrompt(FoundItem found, List<LostItem> lostList) {
        StringBuilder sb = new StringBuilder();
        sb.append("你是一个校园失物招领系统的智能匹配助手。\n");
        sb.append("有人捡到了以下物品，请从丢失物品列表中找出最可能失主。\n\n");

        sb.append("【捡到的物品信息】\n");
        sb.append("- 标题：").append(found.getTitle()).append("\n");
        sb.append("- 类别：").append(found.getCategory() != null ? found.getCategory() : "未知").append("\n");
        sb.append("- 捡到地点：").append(found.getFoundLocation() != null ? found.getFoundLocation() : "未知").append("\n");
        sb.append("- 描述：").append(found.getDescription() != null ? found.getDescription() : "无").append("\n\n");

        sb.append("【用户丢失的物品列表】\n");
        for (int i = 0; i < Math.min(lostList.size(), 15); i++) {
            LostItem lost = lostList.get(i);
            sb.append(i + 1).append(". ID:").append(lost.getId())
                    .append(" | 标题：").append(lost.getTitle())
                    .append(" | 类别：").append(lost.getCategory())
                    .append(" | 地点：").append(lost.getLostLocation())
                    .append(" | 描述：").append(lost.getDescription() != null ? lost.getDescription() : "无")
                    .append("\n");
        }

        sb.append("\n返回格式：JSON数组，每个元素包含 id（丢失物品ID）、score（匹配度0-100）、reason（匹配理由）。");
        sb.append("最多返回3条，只返回JSON。");
        return sb.toString();
    }

    private String callDeepSeek(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "deepseek-chat");
        requestBody.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 1000);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                apiUrl + "/chat/completions",
                HttpMethod.POST,
                entity,
                String.class
        );

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            return "解析失败：" + e.getMessage();
        }
    }
}
