window.ANYEN_CONFIG = {
  supabaseUrl: "https://tgaigagmkrkwnzcyfoir.supabase.co",
  publishableKey: "sb_publishable_JF5cb13wQjynjpN6tN1IeQ_m_NsV2k3"
};
// Supabase THỬ: chỉ dùng trên trang thử cheetahmsu.github.io (hoặc thêm ?supabase=test vào địa chỉ).
// anyen.space luôn dùng Supabase chính ở trên. Điền 2 dòng dưới khi đã tạo dự án thử (xem tools/SUPABASE_THU.md).
window.ANYEN_TEST_CONFIG = {
  supabaseUrl: "",
  publishableKey: ""
};
(function(){var t=window.ANYEN_TEST_CONFIG,q=/[?&]supabase=(test|main)/.exec(location.search),want=q?q[1]:(location.hostname==='cheetahmsu.github.io'?'test':'main');
  if(want==='test'&&t&&t.supabaseUrl&&t.publishableKey){window.ANYEN_CONFIG={supabaseUrl:t.supabaseUrl,publishableKey:t.publishableKey,isTest:true}}})();
