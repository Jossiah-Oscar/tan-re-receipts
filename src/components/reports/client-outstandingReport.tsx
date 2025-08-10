// {/* Filters Section */}
// <Grid>
//     <Grid.Col span={{ base: 12, sm: 6 }}>
//         <TextInput
//             label="Broker Code"
//             placeholder="Enter broker code"
//             leftSection={<IconSearch size={16} />}
//             {...form.getInputProps('brokerCode')}
//         />
//     </Grid.Col>
//
//     <Grid.Col span={{ base: 12, sm: 6 }}>
//         <MultiSelect
//             label="Business Types"
//             placeholder="Select business types"
//             data={businessTypes}
//             clearable
//             searchable
//             {...form.getInputProps('businessTypes')}
//         />
//     </Grid.Col>
//
//     <Grid.Col span={{ base: 12, sm: 6 }}>
//         <MultiSelect
//             label="Currencies"
//             placeholder="Select currencies"
//             data={currencies}
//             clearable
//             searchable
//             {...form.getInputProps('currencies')}
//         />
//     </Grid.Col>
//
//     <Grid.Col span={{ base: 12, sm: 6 }}>
//         <MultiSelect
//             label="Underwriting Years"
//             placeholder="Select years"
//             data={yearOptions}
//             clearable
//             searchable
//             {...form.getInputProps('underwritingYears')}
//         />
//     </Grid.Col>
// </Grid>
//
// {/* Options */}
// <Group grow>
//     <Select
//         label="Group By"
//         data={[
//             { value: 'business_type', label: 'Business Type' },
//             { value: 'currency', label: 'Currency' },
//             { value: 'year', label: 'Year' },
//             { value: 'broker', label: 'Broker' }
//         ]}
//         {...form.getInputProps('groupBy')}
//     />
//
//     <Select
//         label="Sort By"
//         data={[
//             { value: 'underwriting_year', label: 'Underwriting Year' },
//             { value: 'balance_amount', label: 'Balance Amount' },
//             { value: 'transaction_date', label: 'Transaction Date' },
//             { value: 'insured_name', label: 'Insured Name' }
//         ]}
//         {...form.getInputProps('sortBy')}
//     />
// </Group>
//
// <Switch
//     label="Include Zero Balance Transactions"
//     description="Include transactions with zero balance in the report"
//     {...form.getInputProps('includeZeroBalance', { type: 'checkbox' })}
// />