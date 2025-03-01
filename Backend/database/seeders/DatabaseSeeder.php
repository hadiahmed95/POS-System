<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Module;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\UserHasRole;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        Role::insert([
            [
                "role_name" => "Super Admin",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "role_name" => "Admin",
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ]);

        $modules = [
            [
                "module_name" => "Branches",
                "module_slug" => "branches",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Roles & Permissions",
                "module_slug" => "roles-permissions",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Users",
                "module_slug" => "users",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Brands",
                "module_slug" => "brands",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Units",
                "module_slug" => "units",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Vendors",
                "module_slug" => "vendors",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Categories",
                "module_slug" => "categories",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Items",
                "module_slug" => "items",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Purchase",
                "module_slug" => "purchases",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Customer",
                "module_slug" => "customer",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Sales",
                "module_slug" => "sales",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Expenses",
                "module_slug" => "expenses",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "module_name" => "Reports",
                "module_slug" => "reports",
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];
        Module::insert($modules);

        Permission::insert([
            [
                "permission_name" => "View",
                "permission_slug" => "view",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "permission_name" => "Add",
                "permission_slug" => "add",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "permission_name" => "Edit",
                "permission_slug" => "edit",
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "permission_name" => "Delete",
                "permission_slug" => "delete",
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ]);

        Branch::insert([
            "branch_name" => "Main Branch",
            "created_at" => now(),
            "updated_at" => now(),
        ]);

        User::insert([
            [
                "branch_id" => 1,
                "role_id" => 1,
                "name" => "Super Admin",
                "email" => "superadmin@gmail.com",
                "password" => Hash::make("superadmin@321"),
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "branch_id" => 1,
                "role_id" => 2,
                "name" => "Admin",
                "email" => "admin@gmail.com",
                "password" => Hash::make("admin123"),
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ]);

        $super_admin_permissions = $admin_permissions = [];
        foreach($modules as $index => $module) {
            $module_id = $index + 1;
            $super_admin_permissions[] = [
                "user_id" => 1,
                "module_id" => $module_id,
                "permission_id" => 1,
                "is_allowed" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ];
            $super_admin_permissions[] = [
                "user_id" => 1,
                "module_id" => $module_id,
                "permission_id" => 2,
                "is_allowed" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ];
            $super_admin_permissions[] = [
                "user_id" => 1,
                "module_id" => $module_id,
                "permission_id" => 3,
                "is_allowed" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ];
            $super_admin_permissions[] = [
                "user_id" => 1,
                "module_id" => $module_id,
                "permission_id" => 4,
                "is_allowed" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ];

            if( $module_id != 1 ) {
                $admin_permissions[] = [
                    "user_id" => 2,
                    "module_id" => $module_id,
                    "permission_id" => 1,
                    "is_allowed" => 1,
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                $admin_permissions[] = [
                    "user_id" => 2,
                    "module_id" => $module_id,
                    "permission_id" => 2,
                    "is_allowed" => 1,
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                $admin_permissions[] = [
                    "user_id" => 2,
                    "module_id" => $module_id,
                    "permission_id" => 3,
                    "is_allowed" => 1,
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                $admin_permissions[] = [
                    "user_id" => 2,
                    "module_id" => $module_id,
                    "permission_id" => 4,
                    "is_allowed" => 1,
                    "created_at" => now(),
                    "updated_at" => now(),
                ]; 
            }
        }

        UserHasRole::insert($super_admin_permissions);
        UserHasRole::insert($admin_permissions);
    }
}
