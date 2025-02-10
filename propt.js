async function generateRestaurantIntroduction(restaurants) {
  // Gemini API의 모델 가져오기
  const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

  // JSON 데이터를 포함하여 프롬프트 문자열 생성
  const prompt = `Create engaging, SEO-optimized restaurant reviews for international audiences. Write in English, keeping Korean names in their original form when appropriate.
  
  <metadata>
  restaurants: ${JSON.stringify(restaurants, null, 2)}
  target_audience: International food enthusiasts and travelers
  content_type: Restaurant blog reviews
  primary_keywords: Korean restaurants, Seoul food guide, Korean cuisine, local restaurants
  </metadata>
  
  <section1>
  key: hello_content
  requirements:
  - Write a welcoming introduction (200 words max)
  - Include primary keywords naturally
  - Address common search queries about Korean food
  - Highlight unique aspects of Korean dining culture
  </section1>
  
  <section2>
  Format each restaurant review as follows (separate with "---"):
  
  ---
  restaurant_metadata:
    name: [Restaurant Name]
    address: [Full Address]
    phone: [Contact Number]
    cuisine_type: [Type of Cuisine]
    price_range: [Price Category]
  
  title: [Create an SEO-optimized, compelling title (50-60 characters)]
  h1_heading: [Unique, keyword-rich heading different from title]
  meta_description: [150-160 character compelling summary]
  
  main_content:
  - Natural, engaging introduction (100-150 words)
  - Must include location, contact details, and signature dishes
  - Incorporate relevant keywords naturally
  - Include local tips and recommendations
  ---
    
  <section3>
  key: content
  requirements:
  - Comprehensive summary (1500 words)
  - Include H2 and H3 subheadings
  - Cover:
    * Unique selling points
    * Target audience recommendations
    * Taste profiles and specialty dishes
    * Health benefits and nutritional value
    * Customer testimonials and reviews
    * Comparison with similar establishments
    * Best times to visit
    * Insider tips
  - Use structured data markup where appropriate
  - Incorporate primary and secondary keywords naturally
  - Include relevant internal linking opportunities
  - Focus on user intent and search relevance
  </section3>
  
  Additional SEO Guidelines:
  1. Use proper header hierarchy (H1 → H2 → H3)
  2. Include relevant schema markup for restaurants
  3. Optimize for featured snippets
  4. Use descriptive alt text for any images
  5. Incorporate long-tail keywords naturally
  6. Ensure mobile-friendly formatting
  7. Include local SEO elements (neighborhood, landmarks)
  8. Add FAQ section for common queries
  
  Output should prioritize both user experience and search engine visibility while maintaining natural, engaging writing style.`;

  // 모델에 프롬프트를 전달하여 콘텐츠 생성 요청
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  console.log("API 응답:", response); // API 응답 로깅
  return response;
}
