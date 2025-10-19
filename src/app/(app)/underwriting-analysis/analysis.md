Underwriting Analysis Process

So I want to create a process to handle underwriting analysis,

1. A user will pick a form - Facultative, Policy Cesssion, Treaty.
2. then from there they will have a form for them to enter different types of data about the offer recevied eg
   private LocalDate periodFrom;       
   private BigDecimal exchangeRate;
   private BigDecimal sumInsuredOs;
   private BigDecimal premiumOs;
   private BigDecimal shareOfferedPct;
   private BigDecimal shareAcceptedPct;
   private String currency;
   private String country;    // e.g. TANZANIA
   private String insured;    // e.g. LAKE
   private String broker;     // e.g. AAIS
   private String cedant;     // e.g. CRDB
3. we will use this data to analyze the offer based on our program,
4. I have reference sql tables on this file C:\Dev\java\document-register\src\main\java\com\tanre\document_register\underwriting_2\offerTables.sql
5. I did try and create a service method to analyze, here C:\Dev\java\document-register\src\main\java\com\tanre\document_register\underwriting_2\underwritingService.java it might give you a bit of light on what I am trying to achieve.
6. so for the first implementation, I just need to front end part done for demo.
