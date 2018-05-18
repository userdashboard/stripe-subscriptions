# Dashboard sitemap
This site map is generated automatically each time the dashboard starts.

| URL | AUTH | LOCK | TEMPLATE | HTTP REQUESTS | NODEJS | HTML |
|-----|------|------|----------|---------------|--------|------|
|/|GUEST    |        |FULLSCREEN    |               |static-page                    |@userappstore/dashboard    
|/account|         |        |              |               |static-page                    |@userappstore/dashboard    
|/account/authorize|         |        |FULLSCREEN    |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/change-password|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/change-username|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/create-reset-code|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/delete-account|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/delete-account-complete|GUEST    |        |FULLSCREEN    |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/account/delete-reset-code|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/end-all-sessions|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/end-session|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/profile|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/register|GUEST    |        |FULLSCREEN    |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/reset-account|GUEST    |        |FULLSCREEN    |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/reset-codes|         |        |              |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/account/restore-account|GUEST    |        |FULLSCREEN    |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/sessions|         |        |              |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/account/signin|GUEST    |        |FULLSCREEN    |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/account/signout|         |        |FULLSCREEN    |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/account/signout-complete|GUEST    |        |FULLSCREEN    |               |static-page                    |@userappstore/dashboard    
|/account/subscriptions|         |        |              |GET            |/src/www                       |/src/www                   
|/account/subscriptions/cancel-subscription|         |        |              |GET POST       |/src/www                       |/src/www                   
|/account/subscriptions/cards|         |        |              |GET            |/src/www                       |/src/www                   
|/account/subscriptions/change-plan|         |        |              |GET POST       |/src/www                       |/src/www                   
|/account/subscriptions/delete-card|         |        |              |GET POST       |/src/www                       |/src/www                   
|/account/subscriptions/edit-payment-information|         |        |              |GET POST       |/src/www                       |/src/www                   
|/account/subscriptions/invoice|         |        |              |GET            |/src/www                       |/src/www                   
|/account/subscriptions/invoices|         |        |              |GET            |/src/www                       |/src/www                   
|/account/subscriptions/pay-invoice|         |        |              |GET POST       |/src/www                       |/src/www                   
|/account/subscriptions/plan|         |        |              |GET            |/src/www                       |/src/www                   
|/account/subscriptions/plans|         |        |              |GET            |/src/www                       |/src/www                   
|/account/subscriptions/refund-invoice|         |        |              |GET POST       |/src/www                       |/src/www                   
|/account/subscriptions/start-subscription|         |        |              |GET POST       |/src/www                       |/src/www                   
|/account/subscriptions/subscription|         |        |              |GET            |/src/www                       |/src/www                   
|/account/subscriptions/subscriptions|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator|         |        |              |               |static-page                    |@userappstore/dashboard    
|/administrator/account|         |        |              |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/accounts|         |        |              |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/administrators|         |        |              |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/assign-administrator|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/create-reset-code|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/delete-account|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/delete-schedule|         |        |              |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/reset-codes|         |        |              |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/reset-session-key|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/revoke-administrator|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/schedule-account-delete|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/sessions|         |        |              |GET            |@userappstore/dashboard        |@userappstore/dashboard    
|/administrator/subscriptions|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/charge|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/charges|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/coupon|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/coupons|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/create-coupon|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/create-plan|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/create-product|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/customer|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/customers|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/delete-coupon|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/delete-plan|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/delete-product|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/delete-subscription|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/edit-plan|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/edit-product|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/flag-charge|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/forgive-invoice|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/invoice|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/invoices|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/plan|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/plans|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/product|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/products|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/publish-coupon|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/publish-plan|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/publish-product|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/refund|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/refund-charge|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/refunds|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/subscription|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/subscriptions|         |        |              |GET            |/src/www                       |/src/www                   
|/administrator/subscriptions/unpublish-coupon|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/unpublish-plan|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/subscriptions/unpublish-product|         |        |              |GET POST       |/src/www                       |/src/www                   
|/administrator/transfer-ownership|         |        |              |GET POST       |@userappstore/dashboard        |@userappstore/dashboard    
|/api/administrator/account|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/accounts|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/administrators|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/assign-administrator|         |LOCK    |              |PATCH          |@userappstore/dashboard        |                           
|/api/administrator/create-reset-code|         |LOCK    |              |POST           |@userappstore/dashboard        |                           
|/api/administrator/delete-account|         |LOCK    |              |DELETE         |@userappstore/dashboard        |                           
|/api/administrator/delete-schedule|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/profile|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/reset-code|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/reset-codes|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/reset-session-key|         |LOCK    |              |PATCH          |@userappstore/dashboard        |                           
|/api/administrator/revoke-administrator|         |LOCK    |              |DELETE         |@userappstore/dashboard        |                           
|/api/administrator/schedule-account-delete|         |LOCK    |              |DELETE         |@userappstore/dashboard        |                           
|/api/administrator/session|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/sessions|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/administrator/subscriptions/charge|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/charges|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/coupon|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/coupons|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/create-coupon|         |LOCK    |              |POST           |/src/www                       |                           
|/api/administrator/subscriptions/create-plan|         |LOCK    |              |POST           |/src/www                       |                           
|/api/administrator/subscriptions/create-product|         |LOCK    |              |POST           |/src/www                       |                           
|/api/administrator/subscriptions/customer|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/customers|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/delete-coupon|         |LOCK    |              |DELETE         |/src/www                       |                           
|/api/administrator/subscriptions/delete-customer-discount|         |LOCK    |              |DELETE         |/src/www                       |                           
|/api/administrator/subscriptions/delete-plan|         |LOCK    |              |DELETE         |/src/www                       |                           
|/api/administrator/subscriptions/delete-product|         |LOCK    |              |DELETE         |/src/www                       |                           
|/api/administrator/subscriptions/delete-subscription|         |LOCK    |              |DELETE         |/src/www                       |                           
|/api/administrator/subscriptions/delete-subscription-discount|         |LOCK    |              |DELETE         |/src/www                       |                           
|/api/administrator/subscriptions/flag-charge|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/forgive-invoice|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/invoice|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/invoices|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/plan|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/plans|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/product|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/products|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/publish-coupon|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/publish-plan|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/publish-product|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/refund|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/refund-charge|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/refunds|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/subscription|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/subscriptions|         |        |              |GET            |/src/www                       |                           
|/api/administrator/subscriptions/unpublish-coupon|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/unpublish-plan|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/unpublish-product|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/update-customer-coupon|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/update-plan|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/update-product|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/subscriptions/update-subscription-coupon|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/administrator/transfer-ownership|         |LOCK    |              |PATCH          |@userappstore/dashboard        |                           
|/api/user/account|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/user/authenticate|         |        |              |POST           |@userappstore/dashboard        |                           
|/api/user/change-password|         |LOCK    |              |PATCH          |@userappstore/dashboard        |                           
|/api/user/change-username|         |LOCK    |              |PATCH          |@userappstore/dashboard        |                           
|/api/user/create-account|GUEST    |        |              |POST           |@userappstore/dashboard        |                           
|/api/user/create-reset-code|         |LOCK    |              |POST           |@userappstore/dashboard        |                           
|/api/user/delete-account|         |LOCK    |              |DELETE         |@userappstore/dashboard        |                           
|/api/user/delete-reset-code|         |LOCK    |              |DELETE         |@userappstore/dashboard        |                           
|/api/user/end-session|         |        |              |PATCH          |@userappstore/dashboard        |                           
|/api/user/maxmind/country|GUEST    |        |              |GET            |@userappstore/maxmind-geoip    |                           
|/api/user/profile|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/user/reset-account|GUEST    |        |              |PATCH          |@userappstore/dashboard        |                           
|/api/user/reset-code|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/user/reset-codes|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/user/reset-session-key|         |LOCK    |              |PATCH          |@userappstore/dashboard        |                           
|/api/user/restore-account|GUEST    |        |              |PATCH          |@userappstore/dashboard        |                           
|/api/user/session|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/user/sessions|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/user/signin|GUEST    |        |              |POST           |@userappstore/dashboard        |                           
|/api/user/signout|         |        |              |GET            |@userappstore/dashboard        |                           
|/api/user/subscriptions/card|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/cards|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/charge|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/charges|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/create-card|         |LOCK    |              |POST           |/src/www                       |                           
|/api/user/subscriptions/create-customer|         |        |              |POST           |/src/www                       |                           
|/api/user/subscriptions/create-subscription|         |LOCK    |              |POST           |/src/www                       |                           
|/api/user/subscriptions/customer|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/delete-card|         |LOCK    |              |DELETE         |/src/www                       |                           
|/api/user/subscriptions/delete-subscription|         |LOCK    |              |DELETE         |/src/www                       |                           
|/api/user/subscriptions/invoice|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/invoices|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/pay-invoice|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/user/subscriptions/plan|GUEST    |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/plans|GUEST    |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/product|GUEST    |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/products|GUEST    |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/refund|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/refund-charge|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/user/subscriptions/subscription|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/subscriptions|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/upcoming-invoice|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/upcoming-invoices|         |        |              |GET            |/src/www                       |                           
|/api/user/subscriptions/update-subscription-plan|         |LOCK    |              |PATCH          |/src/www                       |                           
|/api/user/update-profile|         |LOCK    |              |PATCH          |@userappstore/dashboard        |                           
|/home|         |        |              |               |static-page                    |@userappstore/dashboard    