<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id');
            $table->foreign('branch_id')->references('id')->on('branches');
            $table->unsignedBigInteger('order_taker_id');
            $table->foreign('order_taker_id')->references('id')->on('users');
            $table->unsignedBigInteger('table_id')->nullable(); // Can be null for takeaway orders
            $table->foreign('table_id')->references('id')->on('tables');
            $table->unsignedBigInteger('customer_id')->nullable(); // Can be null for walk-in customers
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->unsignedBigInteger('created_by');
            $table->foreign('created_by')->references('id')->on('users');
            $table->string('order_number')->unique(); // Unique order number for reference
            $table->dateTime('order_date')->useCurrent();
            $table->float('subtotal');
            $table->float('discount')->default(0);
            $table->float('tax')->default(0);
            $table->float('total');
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'partially_paid', 'paid'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};