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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('brand_id')->nullable()->default(null);
            $table->foreign('brand_id')->references('id')->on('brands');
            $table->unsignedBigInteger('unit_id')->nullable()->default(null);;
            $table->foreign('unit_id')->references('id')->on('units');
            $table->unsignedBigInteger('vendor_id')->nullable()->default(null);;
            $table->foreign('vendor_id')->references('id')->on('vendors');
            $table->unsignedBigInteger('added_by');
            $table->foreign('added_by')->references('id')->on('users');
            $table->text('image')->nullable();
            $table->string('name');
            $table->string('barcode')->unique()->nullable();
            $table->string('old_barcode')->unique()->nullable();
            $table->string('sku')->nullable();
            $table->string('description')->nullable();
            $table->float('purchase_price')->default(0);
            $table->float('price');
            $table->integer('box_quantity');
            $table->string('box_barcode')->nullable();
            $table->float('box_price')->nullable();
            $table->integer('available')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
